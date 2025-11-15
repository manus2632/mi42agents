CREATE TABLE `briefing_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`briefingId` int NOT NULL,
	`userId` int NOT NULL,
	`commentText` text NOT NULL,
	`chapterSection` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `briefing_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_briefings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`briefingId` int NOT NULL,
	`sharedByUserId` int NOT NULL,
	`sharedWithTeamId` int,
	`sharedWithUserId` int,
	`permission` enum('view','comment','edit') NOT NULL DEFAULT 'view',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shared_briefings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','member','viewer') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
