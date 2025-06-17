package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"coaching-app/models" // Make sure this import path matches your module name
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var testDB *gorm.DB

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	RegisterRoutes(router) // You'll need to extract route registration into a function
	return router
}

func setupTestDB() {
	var err error
	// Using an in-memory SQLite database for testing
	testDB, err = gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to test database: " + err.Error())
	}
	DB = testDB // Override the global DB variable for tests
	err = DB.AutoMigrate(&models.TeamMember{}, &models.Team{}, &models.Feedback{})
	if err != nil {
		panic("Failed to migrate test database: " + err.Error())
	}
}

func teardownTestDB() {
	sqlDB, _ := testDB.DB()
	sqlDB.Close()
}

// You need to refactor main.go to have a function like this:
// func RegisterRoutes(router *gin.Engine) { ... existing route registrations ... }
// And call it from main() and setupRouter()

func TestCreateTeamMember(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	memberPayload := `{"name": "Test User", "email": "test@example.com", "pictureurl": "http://example.com/pic.jpg"}`
	req, _ := http.NewRequest("POST", "/members", bytes.NewBufferString(memberPayload))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var member models.TeamMember
	err := json.Unmarshal(w.Body.Bytes(), &member)
	assert.NoError(t, err)
	assert.Equal(t, "Test User", member.Name)
	assert.Equal(t, "test@example.com", member.Email)
}

func TestGetTeamMembers(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()

	// Create a member first
	DB.Create(&models.TeamMember{Name: "User 1", Email: "user1@example.com"})
	DB.Create(&models.TeamMember{Name: "User 2", Email: "user2@example.com"})

	router := setupRouter()

	req, _ := http.NewRequest("GET", "/members", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var members []models.TeamMember
	err := json.Unmarshal(w.Body.Bytes(), &members)
	assert.NoError(t, err)
	assert.Len(t, members, 2)
	assert.Equal(t, "User 1", members[0].Name)
	assert.Equal(t, "User 2", members[1].Name)
}

func TestGetTeamMemberByID(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	// Create a member
	createdMember := models.TeamMember{Name: "Specific User", Email: "specific@example.com", PictureURL: "url"}
	DB.Create(&createdMember)

	// Perform GET request
	req, _ := http.NewRequest("GET", "/members/"+fmt.Sprintf("%d", createdMember.ID), nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var member models.TeamMember
	err := json.Unmarshal(w.Body.Bytes(), &member)
	assert.NoError(t, err)
	assert.Equal(t, createdMember.Name, member.Name)
	assert.Equal(t, createdMember.Email, member.Email)

	// Test non-existent ID
	reqNotFound, _ := http.NewRequest("GET", "/members/99999", nil)
	wNotFound := httptest.NewRecorder()
	router.ServeHTTP(wNotFound, reqNotFound)
	assert.Equal(t, http.StatusNotFound, wNotFound.Code)
}

func TestUpdateTeamMember(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	// Create a member
	memberToUpdate := models.TeamMember{Name: "Original Name", Email: "original@example.com"}
	DB.Create(&memberToUpdate)

	// Perform PUT request
	updatePayload := `{"name": "Updated Name", "email": "updated@example.com", "pictureurl": "http://example.com/newpic.jpg"}`
	req, _ := http.NewRequest("PUT", "/members/"+fmt.Sprintf("%d", memberToUpdate.ID), bytes.NewBufferString(updatePayload))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var updatedMember models.TeamMember
	err := json.Unmarshal(w.Body.Bytes(), &updatedMember)
	assert.NoError(t, err)
	assert.Equal(t, "Updated Name", updatedMember.Name)
	assert.Equal(t, "updated@example.com", updatedMember.Email)

	// Verify persistence
	var persistedMember models.TeamMember
	DB.First(&persistedMember, memberToUpdate.ID)
	assert.Equal(t, "Updated Name", persistedMember.Name)

	// Test non-existent ID
	reqNotFound, _ := http.NewRequest("PUT", "/members/99999", bytes.NewBufferString(updatePayload))
	reqNotFound.Header.Set("Content-Type", "application/json")
	wNotFound := httptest.NewRecorder()
	router.ServeHTTP(wNotFound, reqNotFound)
	assert.Equal(t, http.StatusNotFound, wNotFound.Code)
}

func TestDeleteTeamMember(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	// Create a member
	memberToDelete := models.TeamMember{Name: "To Be Deleted", Email: "delete@example.com"}
	DB.Create(&memberToDelete)

	// Perform DELETE request
	req, _ := http.NewRequest("DELETE", "/members/"+fmt.Sprintf("%d", memberToDelete.ID), nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusNoContent, w.Code)

	// Verify deletion
	var deletedMember models.TeamMember
	err := DB.First(&deletedMember, memberToDelete.ID).Error
	assert.Error(t, err) // Should be gorm.ErrRecordNotFound
	assert.True(t, errors.Is(err, gorm.ErrRecordNotFound))


	// Test non-existent ID
	reqNotFound, _ := http.NewRequest("DELETE", "/members/99999", nil)
	wNotFound := httptest.NewRecorder()
	router.ServeHTTP(wNotFound, reqNotFound)
	// Based on current handler logic, it should be 404 if not found first
	assert.Equal(t, http.StatusNotFound, wNotFound.Code)
}


func TestCreateTeam(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	teamPayload := `{"name": "Awesome Team", "logourl": "http://example.com/logo.png"}`
	req, _ := http.NewRequest("POST", "/teams", bytes.NewBufferString(teamPayload))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var team models.Team
	err := json.Unmarshal(w.Body.Bytes(), &team)
	assert.NoError(t, err)
	assert.Equal(t, "Awesome Team", team.Name)
	assert.Equal(t, "http://example.com/logo.png", team.LogoURL)
	assert.NotZero(t, team.ID)
}

func TestGetTeams(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	// Create teams
	DB.Create(&models.Team{Name: "Team Alpha", LogoURL: "logoA.png"})
	DB.Create(&models.Team{Name: "Team Beta", LogoURL: "logoB.png"})

	req, _ := http.NewRequest("GET", "/teams", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var teams []models.Team
	err := json.Unmarshal(w.Body.Bytes(), &teams)
	assert.NoError(t, err)
	assert.Len(t, teams, 2)
	assert.Equal(t, "Team Alpha", teams[0].Name)
	assert.Equal(t, "Team Beta", teams[1].Name)
}

func TestGetTeamByID(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	// Create a team
	createdTeam := models.Team{Name: "Specific Team", LogoURL: "specific_logo.png"}
	DB.Create(&createdTeam)

	// Perform GET request
	req, _ := http.NewRequest("GET", "/teams/"+fmt.Sprintf("%d", createdTeam.ID), nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var team models.Team
	err := json.Unmarshal(w.Body.Bytes(), &team)
	assert.NoError(t, err)
	assert.Equal(t, createdTeam.Name, team.Name)
	assert.Equal(t, createdTeam.LogoURL, team.LogoURL)
	// assert.Empty(t, team.Members) // Assuming no members assigned yet for this test

	// Test non-existent ID
	reqNotFound, _ := http.NewRequest("GET", "/teams/99999", nil)
	wNotFound := httptest.NewRecorder()
	router.ServeHTTP(wNotFound, reqNotFound)
	assert.Equal(t, http.StatusNotFound, wNotFound.Code)
}

func TestUpdateTeam(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	teamToUpdate := models.Team{Name: "Original Team Name", LogoURL: "original_logo.png"}
	DB.Create(&teamToUpdate)

	updatePayload := `{"name": "Updated Team Name", "logourl": "updated_logo.png"}`
	req, _ := http.NewRequest("PUT", fmt.Sprintf("/teams/%d", teamToUpdate.ID), bytes.NewBufferString(updatePayload))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	var updatedTeam models.Team
	err := json.Unmarshal(w.Body.Bytes(), &updatedTeam)
	assert.NoError(t, err)
	assert.Equal(t, "Updated Team Name", updatedTeam.Name)
	assert.Equal(t, "updated_logo.png", updatedTeam.LogoURL)

	var persistedTeam models.Team
	DB.First(&persistedTeam, teamToUpdate.ID)
	assert.Equal(t, "Updated Team Name", persistedTeam.Name)

	reqNotFound, _ := http.NewRequest("PUT", "/teams/99999", bytes.NewBufferString(updatePayload))
	reqNotFound.Header.Set("Content-Type", "application/json")
	wNotFound := httptest.NewRecorder()
	router.ServeHTTP(wNotFound, reqNotFound)
	assert.Equal(t, http.StatusNotFound, wNotFound.Code)
}

func TestDeleteTeam(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	teamToDelete := models.Team{Name: "Team To Delete", LogoURL: "delete_logo.png"}
	DB.Create(&teamToDelete)

	// Note: If team has members, the association needs to be cleared first
	// or ensure GORM handles it via cascading or hooks if that's intended.
	// For this test, assuming a team without members or that association is handled.
	// The current DeleteTeam handler does DB.Select("Members").Delete(&team) which might be problematic.
	// It should be DB.Model(&team).Association("Members").Clear()

	req, _ := http.NewRequest("DELETE", fmt.Sprintf("/teams/%d", teamToDelete.ID), nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusNoContent, w.Code)

	var deletedTeam models.Team
	err := DB.First(&deletedTeam, teamToDelete.ID).Error
	assert.Error(t, err)
	assert.True(t, errors.Is(err, gorm.ErrRecordNotFound))

	reqNotFound, _ := http.NewRequest("DELETE", "/teams/99999", nil)
	wNotFound := httptest.NewRecorder()
	router.ServeHTTP(wNotFound, reqNotFound)
	assert.Equal(t, http.StatusNotFound, wNotFound.Code)
}

func TestAssignMemberToTeam(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	member := models.TeamMember{Name: "Assignable Member", Email: "assign@example.com"}
	DB.Create(&member)
	team := models.Team{Name: "Target Team", LogoURL: "target_logo.png"}
	DB.Create(&team)

	req, _ := http.NewRequest("POST", fmt.Sprintf("/teams/%d/members/%d", team.ID, member.ID), nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)

	var responseMessage map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &responseMessage)
	assert.NoError(t, err)
	assert.Equal(t, "Member assigned to team successfully", responseMessage["message"])

	var teamWithMembers models.Team
	DB.Preload("Members").First(&teamWithMembers, team.ID)
	assert.Len(t, teamWithMembers.Members, 1)
	assert.Equal(t, member.ID, teamWithMembers.Members[0].ID)

	// Test non-existent team
	reqNonExistentTeam, _ := http.NewRequest("POST", fmt.Sprintf("/teams/%d/members/%d", 99999, member.ID), nil)
	wNonExistentTeam := httptest.NewRecorder()
	router.ServeHTTP(wNonExistentTeam, reqNonExistentTeam)
	assert.Equal(t, http.StatusNotFound, wNonExistentTeam.Code)

	// Test non-existent member
	reqNonExistentMember, _ := http.NewRequest("POST", fmt.Sprintf("/teams/%d/members/%d", team.ID, 88888), nil)
	wNonExistentMember := httptest.NewRecorder()
	router.ServeHTTP(wNonExistentMember, reqNonExistentMember)
	assert.Equal(t, http.StatusNotFound, wNonExistentMember.Code)
}


func TestGiveFeedbackToMember(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	member := models.TeamMember{Name: "Feedback Target Member", Email: "feedback_member@example.com"}
	DB.Create(&member)

	feedbackPayload := fmt.Sprintf(`{"content": "Great job, Member!", "targetid": %d, "targettype": "member"}`, member.ID)
	req, _ := http.NewRequest("POST", "/feedback", bytes.NewBufferString(feedbackPayload))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	var feedback models.Feedback
	err := json.Unmarshal(w.Body.Bytes(), &feedback)
	assert.NoError(t, err)
	assert.Equal(t, "Great job, Member!", feedback.Content)
	assert.Equal(t, member.ID, feedback.TargetID)
	assert.Equal(t, "member", feedback.TargetType)
}

func TestGiveFeedbackToTeam(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	team := models.Team{Name: "Feedback Target Team", LogoURL: "feedback_team_logo.png"}
	DB.Create(&team)

	feedbackPayload := fmt.Sprintf(`{"content": "Team is awesome!", "targetid": %d, "targettype": "team"}`, team.ID)
	req, _ := http.NewRequest("POST", "/feedback", bytes.NewBufferString(feedbackPayload))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusCreated, w.Code)

	var feedback models.Feedback
	err := json.Unmarshal(w.Body.Bytes(), &feedback)
	assert.NoError(t, err)
	assert.Equal(t, "Team is awesome!", feedback.Content)
	assert.Equal(t, team.ID, feedback.TargetID)
	assert.Equal(t, "team", feedback.TargetType)
}

func TestGiveFeedbackInvalidTargetType(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	feedbackPayload := `{"content": "Doesnt matter", "targetid": 1, "targettype": "invalid_type"}`
	req, _ := http.NewRequest("POST", "/feedback", bytes.NewBufferString(feedbackPayload))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusBadRequest, w.Code) // Based on handler validation
}

func TestGiveFeedbackNonExistentTargetID_Member(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	feedbackPayload := `{"content": "For non-existent member", "targetid": 99999, "targettype": "member"}`
	req, _ := http.NewRequest("POST", "/feedback", bytes.NewBufferString(feedbackPayload))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusNotFound, w.Code) // Based on handler validation
}

func TestGiveFeedbackNonExistentTargetID_Team(t *testing.T) {
	setupTestDB()
	defer teardownTestDB()
	router := setupRouter()

	feedbackPayload := `{"content": "For non-existent team", "targetid": 88888, "targettype": "team"}`
	req, _ := http.NewRequest("POST", "/feedback", bytes.NewBufferString(feedbackPayload))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusNotFound, w.Code) // Based on handler validation
}
