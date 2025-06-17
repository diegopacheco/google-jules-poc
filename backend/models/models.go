package models

type TeamMember struct {
	ID         uint   `gorm:"primaryKey;column:id"`
	Name       string `gorm:"column:name"`
	PictureURL string `gorm:"column:picture_url"`
	Email      string `gorm:"column:email;unique"`
}

type Team struct {
	ID      uint   `gorm:"primaryKey;column:id"`
	Name    string `gorm:"column:name;unique"`
	LogoURL string `gorm:"column:logo_url"`
	Members []TeamMember `gorm:"many2many:team_member_assignments;"` // Changed join table name
}

type Feedback struct {
	ID         uint   `gorm:"primaryKey;column:id"`
	Content    string `gorm:"column:content"`
	TargetID   uint   `gorm:"column:target_id"`
	TargetType string `gorm:"column:target_type"` // "team" or "member"
}
