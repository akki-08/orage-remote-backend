export function checkAuth(req, res, next) {
  const authHeaders = req.headers["authorization"];
  const clientAccessToken = authHeaders && authHeaders.split(" ")[1];
  // const clientAccessToken = req.cookies['accessToken'];

  res.locals.accessToken = clientAccessToken;

  if (!clientAccessToken) {
    return res.status(401).json({
      authenticated: false,
    });
  }
  next();
}
