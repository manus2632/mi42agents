CREATE TABLE `agent_model_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentType` enum('market_analyst','trend_scout','survey_assistant','strategy_advisor') NOT NULL,
	`modelProvider` enum('manus_forge','open_webui') NOT NULL DEFAULT 'open_webui',
	`modelName` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_model_configs_id` PRIMARY KEY(`id`)
);
