CREATE TABLE `agent_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentType` enum('market_analyst','trend_scout','survey_assistant','strategy_advisor','demand_forecasting','project_intelligence','pricing_strategy','competitor_intelligence') NOT NULL,
	`systemPrompt` text NOT NULL,
	`estimatedCredits` int NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_configs_id` PRIMARY KEY(`id`),
	CONSTRAINT `agent_configs_agentType_unique` UNIQUE(`agentType`)
);
--> statement-breakpoint
CREATE TABLE `system_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`configKey` varchar(100) NOT NULL,
	`configValue` text,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_config_configKey_unique` UNIQUE(`configKey`)
);
--> statement-breakpoint
ALTER TABLE `credit_packages` MODIFY COLUMN `isActive` int NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `email_verifications` MODIFY COLUMN `token` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `email_verifications` MODIFY COLUMN `verified` int NOT NULL;--> statement-breakpoint
ALTER TABLE `email_verifications` MODIFY COLUMN `verified` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `email_verifications` MODIFY COLUMN `createdAt` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `emailVerified` int NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `emailVerified` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `isFreemium` int NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `isActive` int NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `onboardingCompleted` int NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `onboardingCompleted` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `email_verifications` DROP COLUMN `verifiedAt`;