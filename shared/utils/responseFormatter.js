export const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ status:statusCode, success: true, data, message:message });
};

export const error = (res, message = 'Error', statusCode = 500, errors = null) => {
  const response = { status:statusCode, success: false, error:message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json({status:statusCode, success: false, error:message, ...response});
};

export const paginated = (res, data, total, page, limit) => {
  return res.status(200).json({
    status:200,
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};
