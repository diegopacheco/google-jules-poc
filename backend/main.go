package main

import (
	"errors"
	"log"
	"net/http"
	"os" // Import the "os" package

	"coaching-app/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var MainDB *gorm.DB // Renamed DB to MainDB

func InitDatabase(dsn string) error {
	var err error
	MainDB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}

	//err = MainDB.AutoMigrate(&models.TeamMember{}, &models.Team{}, &models.Feedback{})
	//if err != nil {
	//return err
	//}
	return nil
}

// TeamMember CRUD operations
func CreateTeamMember(c *gin.Context) {
	var member models.TeamMember
	if err := c.ShouldBindJSON(&member); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := MainDB.Create(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, member)
}

func GetTeamMembers(c *gin.Context) {
	var members []models.TeamMember
	if err := MainDB.Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, members)
}

func GetTeamMember(c *gin.Context) {
	id := c.Param("id")
	var member models.TeamMember
	// Create a new GORM session for this operation
	if err := MainDB.Session(&gorm.Session{NewDB: true}).First(&member, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, member)
}

func UpdateTeamMember(c *gin.Context) {
	id := c.Param("id")
	var member models.TeamMember
	if err := MainDB.First(&member, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	var updatedMember models.TeamMember
	if err := c.ShouldBindJSON(&updatedMember); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// GORM automatically uses the primary key from the struct for updates
	// So, we ensure the ID from path is set on the struct to be updated
	updatedMember.ID = member.ID

	if err := MainDB.Model(&member).Updates(updatedMember).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, member) // Return the updated member (GORM updates the original struct)
}

func DeleteTeamMember(c *gin.Context) {
	id := c.Param("id")
	var member models.TeamMember
	// Check if record exists before deleting
	if err := MainDB.First(&member, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	if err := MainDB.Delete(&models.TeamMember{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

// Team CRUD operations
func CreateTeam(c *gin.Context) {
	var team models.Team
	if err := c.ShouldBindJSON(&team); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := MainDB.Create(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, team)
}

func GetTeams(c *gin.Context) {
	var teams []models.Team
	if err := MainDB.Preload("Members").Find(&teams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, teams)
}

func GetTeam(c *gin.Context) {
	id := c.Param("id")
	var team models.Team
	if err := MainDB.Preload("Members").First(&team, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, team)
}

func UpdateTeam(c *gin.Context) {
	id := c.Param("id")
	var team models.Team
	if err := MainDB.First(&team, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	var updatedTeam models.Team
	if err := c.ShouldBindJSON(&updatedTeam); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	updatedTeam.ID = team.ID // Ensure ID is not changed

	if err := MainDB.Model(&team).Updates(updatedTeam).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, team) // Return the updated team
}

func DeleteTeam(c *gin.Context) {
	id := c.Param("id")
	var team models.Team
	// Check if record exists
	if err := MainDB.First(&team, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// GORM will handle many2many associations by default (removing entries from join table)
	if err := MainDB.Select("Members").Delete(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear team members association: " + err.Error()})
		return
	}

	if err := MainDB.Delete(&models.Team{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

// AssignMemberToTeam assigns a member to a team
func AssignMemberToTeam(c *gin.Context) {
	teamID := c.Param("id") // Changed from "team_id" to "id"
	memberID := c.Param("member_id")

	var team models.Team
	if err := MainDB.First(&team, teamID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding team: " + err.Error()})
		}
		return
	}

	var member models.TeamMember
	if err := MainDB.First(&member, memberID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding member: " + err.Error()})
		}
		return
	}

	if err := MainDB.Model(&team).Association("Members").Append(&member); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign member to team: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member assigned to team successfully"})
}

// RemoveMemberFromTeam removes a member from a team
func RemoveMemberFromTeam(c *gin.Context) {
	teamID := c.Param("id") // Changed from "team_id" to "id"
	memberID := c.Param("member_id")

	var team models.Team
	if err := MainDB.First(&team, teamID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding team: " + err.Error()})
		}
		return
	}

	var member models.TeamMember
	if err := MainDB.First(&member, memberID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding member: " + err.Error()})
		}
		return
	}

	if err := MainDB.Model(&team).Association("Members").Delete(&member); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove member from team: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member removed from team successfully"})
}

// GiveFeedback creates a new feedback entry
func GiveFeedback(c *gin.Context) {
	var feedback models.Feedback
	if err := c.ShouldBindJSON(&feedback); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate TargetType and TargetID
	if feedback.TargetType != "team" && feedback.TargetType != "member" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid TargetType. Must be 'team' or 'member'."})
		return
	}

	if feedback.TargetType == "team" {
		var team models.Team
		if err := MainDB.First(&team, feedback.TargetID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Target team not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding target team: " + err.Error()})
			}
			return
		}
	} else if feedback.TargetType == "member" {
		var member models.TeamMember
		if err := MainDB.First(&member, feedback.TargetID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Target member not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding target member: " + err.Error()})
			}
			return
		}
	}

	if err := MainDB.Create(&feedback).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create feedback: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, feedback)
}

// GetFeedbacks retrieves feedbacks, optionally filtered by member_id or team_id
func GetFeedbacks(c *gin.Context) {
	var feedbacks []models.Feedback
	query := MainDB

	memberID := c.Query("member_id")
	teamID := c.Query("team_id")

	if memberID != "" {
		query = query.Where("target_type = ? AND target_id = ?", "member", memberID)
	} else if teamID != "" {
		query = query.Where("target_type = ? AND target_id = ?", "team", teamID)
	}
	// Add more complex preloading if you want to include Giver details or Target details by default.
	// For example, to include member/team names, you might need a more complex query or post-processing.
	// For now, we return the raw feedback objects. The frontend can make separate calls if needed for names.

	if err := query.Find(&feedbacks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve feedbacks: " + err.Error()})
		return
	}

	// To enhance the response, you might want to fetch target names.
	// This is a simplified example. In a real app, this could get complex and might be better handled
	// by joining tables or making additional targeted queries.
	// For example (pseudo-code, needs actual implementation):
	// for i, fb := range feedbacks {
	// 	if fb.TargetType == "member" {
	// 		var member models.TeamMember
	// 		if MainDB.First(&member, fb.TargetID).Error == nil {
	// 			feedbacks[i].TargetName = member.Name // Assuming Feedback struct has a TargetName field (non-DB)
	// 		}
	// 	} else if fb.TargetType == "team" {
	// 		var team models.Team
	// 		if MainDB.First(&team, fb.TargetID).Error == nil {
	// 			feedbacks[i].TargetName = team.Name // Assuming Feedback struct has a TargetName field (non-DB)
	// 		}
	// 	}
	// }

	c.JSON(http.StatusOK, feedbacks)
}

func main() {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		log.Fatalf("DB_DSN environment variable not set")
	}

	if err := InitDatabase(dsn); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	r := gin.Default()

	// Configure CORS to allow frontend requests
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"}
	config.ExposeHeaders = []string{"Content-Length"}
	config.AllowCredentials = true
	r.Use(cors.New(config))

	RegisterRoutes(r)

	log.Println("Backend server starting on port 8080...")
	r.Run(":8080") // Listen and serve on 0.0.0.0:8080
}

func RegisterRoutes(router *gin.Engine) {
	// TeamMember routes
	memberRoutes := router.Group("/members")
	{
		memberRoutes.POST("/", CreateTeamMember)
		memberRoutes.GET("/", GetTeamMembers)
		memberRoutes.GET("/:id", GetTeamMember)
		memberRoutes.PUT("/:id", UpdateTeamMember)
		memberRoutes.DELETE("/:id", DeleteTeamMember)
	}

	// Team routes
	teamRoutes := router.Group("/teams")
	{
		teamRoutes.POST("/", CreateTeam)
		teamRoutes.GET("/", GetTeams)
		teamRoutes.GET("/:id", GetTeam)
		teamRoutes.PUT("/:id", UpdateTeam)
		teamRoutes.DELETE("/:id", DeleteTeam)

		// Move team-member assignment routes to avoid conflict
		// Use a different path structure
		teamRoutes.POST("/:id/assign/:member_id", AssignMemberToTeam)
		teamRoutes.DELETE("/:id/remove/:member_id", RemoveMemberFromTeam)
	}

	// Feedback routes
	feedbackRoutes := router.Group("/feedback")
	{
		feedbackRoutes.POST("/", GiveFeedback)
		feedbackRoutes.GET("/", GetFeedbacks)
	}
}
