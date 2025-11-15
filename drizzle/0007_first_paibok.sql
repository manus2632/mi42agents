CREATE TABLE `credit_packages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`credits` int NOT NULL,
	`price` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'EUR',
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credit_packages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`paymentTransactionId` int,
	`subscriptionId` int,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'EUR',
	`taxRate` int NOT NULL DEFAULT 19,
	`taxAmount` int NOT NULL,
	`totalAmount` int NOT NULL,
	`billingName` varchar(255) NOT NULL,
	`billingEmail` varchar(320) NOT NULL,
	`billingAddress` text,
	`billingVatId` varchar(50),
	`itemDescription` text NOT NULL,
	`pdfUrl` varchar(500),
	`status` enum('draft','issued','paid','canceled') NOT NULL DEFAULT 'draft',
	`issuedAt` timestamp,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `payment_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`paymentProvider` enum('stripe','paypal') NOT NULL,
	`paymentType` enum('credit_package','subscription') NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'EUR',
	`creditsAdded` int,
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`providerTransactionId` varchar(255),
	`providerCustomerId` varchar(255),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `payment_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planType` enum('basic','pro','business','enterprise') NOT NULL,
	`status` enum('active','canceled','expired','paused') NOT NULL DEFAULT 'active',
	`monthlyCredits` int NOT NULL,
	`monthlyPrice` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'EUR',
	`paymentProvider` enum('stripe','paypal') NOT NULL,
	`providerSubscriptionId` varchar(255),
	`providerCustomerId` varchar(255),
	`currentPeriodStart` timestamp NOT NULL,
	`currentPeriodEnd` timestamp NOT NULL,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
