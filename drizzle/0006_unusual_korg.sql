CREATE TABLE `automated_briefings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`briefingType` enum('daily','weekly') NOT NULL,
	`title` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`scheduledFor` timestamp NOT NULL,
	`status` enum('pending','generated','sent','failed') NOT NULL DEFAULT 'pending',
	CONSTRAINT `automated_briefings_id` PRIMARY KEY(`id`)
);
