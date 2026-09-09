export function filterTransactions(transactions, period) {
  const now = new Date();

  switch (period) {
    case "thisMonth": {
      return transactions.filter((tx) => {
        const date = new Date(tx.createdAt);

        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      });
    }

    case "lastMonth": {
      let month = now.getMonth() - 1;
      let year = now.getFullYear();

      if (month < 0) {
        month = 11;
        year--;
      }

      return transactions.filter((tx) => {
        const date = new Date(tx.createdAt);

        return date.getMonth() === month && date.getFullYear() === year;
      });
    }

    case "thisYear": {
      return transactions.filter((tx) => {
        const date = new Date(tx.createdAt);

        return date.getFullYear() === now.getFullYear();
      });
    }

    case "lastYear": {
      return transactions.filter((tx) => {
        const date = new Date(tx.createdAt);

        return date.getFullYear() === now.getFullYear() - 1;
      });
    }

    case "all":
    default:
      return transactions;
  }
}
