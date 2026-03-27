export function notFound(req, res) {
  res.status(404).json({ message: "Not found" });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = Number(err?.status) || 500;
  const message =
    status === 500 ? "Internal server error" : err?.message || "Request failed";

  if (status === 500) {
    // Avoid leaking details to clients. Log server-side for debugging.
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({ message });
}

