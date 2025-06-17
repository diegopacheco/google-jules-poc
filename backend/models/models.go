package models

type TeamMember struct {
	ID         uint   `gorm:"primaryKey"`
	Name       string
	PictureURL string
	Email      string `gorm:"unique"`
}

type Team struct {
	ID      uint   `gorm:"primaryKey"`
	Name    string `gorm:"unique"`
	LogoURL string
	Members []TeamMember `gorm:"many2many:team_members;"`
}

type Feedback struct {
	ID         uint   `gorm:"primaryKey"`
	Content    string
	TargetID   uint
	TargetType string // "team" or "member"
}
