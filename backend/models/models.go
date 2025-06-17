package models

type TeamMember struct {
	ID         uint64 `gorm:"primaryKey;column:id"`
	Name       string `gorm:"column:name"`
	PictureURL string `gorm:"column:picture_url"`
	Email      string `gorm:"column:email;unique"`
}

type Team struct {
	ID      uint64       `gorm:"primaryKey;column:id"`
	Name    string       `gorm:"column:name;unique"`
	LogoURL string       `gorm:"column:logo_url"`
	Members []TeamMember `gorm:"many2many:team_member_assignments;"`
}

type Feedback struct {
	ID         uint64 `gorm:"primaryKey;column:id"`
	Content    string `gorm:"column:content"`
	TargetID   uint64 `gorm:"column:target_id"`
	TargetType string `gorm:"column:target_type"`
}
