import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowDownCircle, ArrowUpCircle, Coins } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Credits() {
  const { t } = useTranslation();
  const { data: balance, isLoading: balanceLoading } = trpc.credits.getBalance.useQuery();
  const { data: transactions, isLoading: transactionsLoading } = trpc.credits.getTransactions.useQuery();
  const purchaseMutation = trpc.credits.purchase.useMutation();
  const utils = trpc.useUtils();

  const handlePurchase = async (amount: number) => {
    await purchaseMutation.mutateAsync({ amount });
    utils.credits.getBalance.invalidate();
    utils.credits.getTransactions.invalidate();
  };

  const creditPackages = [
    { amount: 1000, price: "€10", popular: false },
    { amount: 5000, price: "€45", popular: true },
    { amount: 10000, price: "€80", popular: false },
    { amount: 25000, price: "€180", popular: false },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("nav.credits")}</h1>
        <p className="text-gray-600 mb-8">Verwalten Sie Ihr Credit-Guthaben</p>

        {/* Current Balance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              {t("credits.balance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="text-gray-500">{t("common.loading")}</div>
            ) : (
              <div className="text-4xl font-bold text-gray-900">{balance?.toLocaleString()} Credits</div>
            )}
          </CardContent>
        </Card>

        {/* Purchase Packages */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("credits.purchase")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPackages.map((pkg) => (
              <Card key={pkg.amount} className={pkg.popular ? "border-gray-900 border-2" : ""}>
                <CardHeader>
                  {pkg.popular && (
                    <div className="text-xs font-semibold text-gray-900 mb-2">BELIEBT</div>
                  )}
                  <CardTitle className="text-2xl">{pkg.amount.toLocaleString()}</CardTitle>
                  <CardDescription>Credits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">{pkg.price}</div>
                  <Button
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => handlePurchase(pkg.amount)}
                    disabled={purchaseMutation.isPending}
                  >
                    Kaufen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>{t("credits.transaction_history")}</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="text-gray-500">{t("common.loading")}</div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      {tx.amount > 0 ? (
                        <ArrowUpCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{tx.description}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString("de-DE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className={`font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount.toLocaleString()} Credits
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">Keine Transaktionen vorhanden</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
