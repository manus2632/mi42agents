CREATE TABLE `system_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`logLevel` enum('info','warning','error','debug') NOT NULL,
	`logType` enum('api_call','llm_usage','error','auth','system') NOT NULL,
	`message` text NOT NULL,
	`details` text,
	`userId` int,
	`taskId` int,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_logs_id` PRIMARY KEY(`id`)
);
