package main

import (
	"errors"
	"log"
	"net/http"
	"os" // Import the "os" package

	"coaching-app/models"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDatabase(dsn string) error {
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}

	err = DB.AutoMigrate(&models.TeamMember{}, &models.Team{}, &models.Feedback{})
	if err != nil {
		return err
	}
	return nil
}

// TeamMember CRUD operations
func CreateTeamMember(c *gin.Context) {
	var member models.TeamMember
	if err := c.ShouldBindJSON(&member); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := DB.Create(&member).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, member)
}

func GetTeamMembers(c *gin.Context) {
	var members []models.TeamMember
	if err := DB.Find(&members).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, members)
}

func GetTeamMember(c *gin.Context) {
	id := c.Param("id")
	var member models.TeamMember
	if err := DB.First(&member, id).Error; err != nil {
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
	if err := DB.First(&member, id).Error; err != nil {
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

	if err := DB.Model(&member).Updates(updatedMember).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, member) // Return the updated member (GORM updates the original struct)
}

func DeleteTeamMember(c *gin.Context) {
	id := c.Param("id")
	var member models.TeamMember
	// Check if record exists before deleting
	if err := DB.First(&member, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	if err := DB.Delete(&models.TeamMember{}, id).Error; err != nil {
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

	if err := DB.Create(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, team)
}

func GetTeams(c *gin.Context) {
	var teams []models.Team
	if err := DB.Preload("Members").Find(&teams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, teams)
}

func GetTeam(c *gin.Context) {
	id := c.Param("id")
	var team models.Team
	if err := DB.Preload("Members").First(&team, id).Error; err != nil {
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
	if err := DB.First(&team, id).Error; err != nil {
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

	if err := DB.Model(&team).Updates(updatedTeam).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, team) // Return the updated team
}

func DeleteTeam(c *gin.Context) {
	id := c.Param("id")
	var team models.Team
	// Check if record exists
	if err := DB.First(&team, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// GORM will handle many2many associations by default (removing entries from join table)
	if err := DB.Select("Members").Delete(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear team members association: " + err.Error()})
		return
	}


	if err := DB.Delete(&models.Team{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}

// AssignMemberToTeam assigns a member to a team
func AssignMemberToTeam(c *gin.Context) {
	teamID := c.Param("team_id")
	memberID := c.Param("member_id")

	var team models.Team
	if err := DB.First(&team, teamID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding team: " + err.Error()})
		}
		return
	}

	var member models.TeamMember
	if err := DB.First(&member, memberID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team member not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding member: " + err.Error()})
		}
		return
	}

	if err := DB.Model(&team).Association("Members").Append(&member); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign member to team: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member assigned to team successfully"})
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
		if err := DB.First(&team, feedback.TargetID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Target team not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding target team: " + err.Error()})
			}
			return
		}
	} else if feedback.TargetType == "member" {
		var member models.TeamMember
		if err := DB.First(&member, feedback.TargetID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Target member not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding target member: " + err.Error()})
			}
			return
		}
	}

	if err := DB.Create(&feedback).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create feedback: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, feedback)
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
		teamRoutes.POST("/:team_id/members/:member_id", AssignMemberToTeam)
	}

	// Feedback routes
	feedbackRoutes := router.Group("/feedback")
	{
		feedbackRoutes.POST("/", GiveFeedback)
	}
}
