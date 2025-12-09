export const buildSalesQuery = (query) => {
  const {
    search,
    region,
    gender,
    minAge,
    maxAge,
    category,
    tags,
    paymentMethod,
    startDate,
    endDate,
  } = query;

  const filter = {};

  // Full-text search on customerName or phoneNumber
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ customerName: regex }, { phoneNumber: regex }];
  }

  if (region) {
    const arr = region.split(",");
    filter.customerRegion = { $in: arr };
  }

  if (gender) {
    const arr = gender.split(",");
    filter.gender = { $in: arr };
  }

  // Age range
  if (minAge || maxAge) {
    filter.age = {};
    if (minAge) filter.age.$gte = Number(minAge);
    if (maxAge) filter.age.$lte = Number(maxAge);
  }

  if (category) {
    const arr = category.split(",");
    filter.productCategory = { $in: arr };
  }

  if (tags) {
    const arr = tags.split(",");
    filter.tags = { $in: arr };
  }

  if (paymentMethod) {
    const arr = paymentMethod.split(",");
    filter.paymentMethod = { $in: arr };
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  return filter;
};

export const buildSort = (sortField, sortOrder) => {
  if (!sortField) {
    // default newest first
    return { date: -1 };
  }

  const order = sortOrder === "asc" ? 1 : -1;

  // allowed fields: date, quantity, customerName
  const map = {
    date: "date",
    quantity: "quantity",
    customerName: "customerName",
  };

  const field = map[sortField] || "date";
  return { [field]: order };
};
