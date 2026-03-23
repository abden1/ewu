export function validateCronRequest(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization");
  const cronHeader = request.headers.get("x-cron-secret");

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    if (token === cronSecret) return true;
  }

  if (cronHeader === cronSecret) return true;

  return false;
}

export function cronUnauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
