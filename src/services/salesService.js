import { Sale } from "../models/Sale.js";
import { buildSalesQuery, buildSort } from "../utils/buildQuery.js";

export const getSales = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const filter = buildSalesQuery(query);
  const sort = buildSort(query.sortField, query.sortOrder);

  const [items, total, stats] = await Promise.all([
    Sale.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Sale.countDocuments(filter),
    Sale.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalUnits: { $sum: "$quantity" },
          totalAmount: { $sum: "$totalAmount" },
          totalDiscount: { $sum: "$discountPercentage" },
        },
      },
    ]),
  ]);

  const agg = stats[0] || {
    totalUnits: 0,
    totalAmount: 0,
    totalDiscount: 0,
  };

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    stats: {
      totalUnits: agg.totalUnits,
      totalAmount: agg.totalAmount,
      totalDiscount: agg.totalDiscount,
    },
  };
};
