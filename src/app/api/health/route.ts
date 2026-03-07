interface HealthResponse {
  status: "ok";
  service: "elura-backend";
}

export async function GET(): Promise<Response> {
  const payload: HealthResponse = {
    status: "ok",
    service: "elura-backend"
  };

  return Response.json(payload, { status: 200 });
}

