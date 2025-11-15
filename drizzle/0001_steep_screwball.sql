CREATE TABLE `agent_briefings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`userId` int NOT NULL,
	`briefingTitle` text,
	`briefingData` text,
	`isOnboarding` boolean DEFAULT false,
	`language` varchar(5) NOT NULL DEFAULT 'de',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_briefings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_company_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyDomain` varchar(255) NOT NULL,
	`companyName` text,
	`productPortfolio` text,
	`competitors` text,
	`analysisData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_company_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_credit_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`transactionType` enum('purchase','usage','refund','bonus') NOT NULL,
	`description` text,
	`relatedTaskId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_credit_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_credits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balance` int NOT NULL DEFAULT 5000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_credits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentType` enum('market_analyst','trend_scout','survey_assistant','strategy_advisor') NOT NULL,
	`taskPrompt` text NOT NULL,
	`taskStatus` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`creditsEstimated` int,
	`creditsActual` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `agent_tasks_id` PRIMARY KEY(`id`)
);
