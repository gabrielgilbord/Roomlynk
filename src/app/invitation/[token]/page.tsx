import { fetchInvitationByToken } from "@/lib/invitations";
import { getSessionProfile } from "@/lib/auth";
import { InvitationFlow } from "@/components/contracts/invitation-flow";
import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface InvitationPageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = await params;
  const data = await fetchInvitationByToken(token);
  const profile = await getSessionProfile();

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen px-4">
        <Card className="max-w-md text-center" padding="lg">
          <Logo className="justify-center mb-6" />
          <h1 className="rl-display text-xl font-medium text-ink">
            Invitación no válida
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            El enlace ha expirado, ya fue usado o no existe.
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button variant="outline">Volver al inicio</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!profile) {
    const next = `/invitation/${token}`;
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen px-4">
        <Card className="max-w-md" padding="lg">
          <Logo className="justify-center mb-6" />
          <h1 className="rl-display text-xl font-medium text-ink text-center">
            Invitación de alquiler
          </h1>
          <p className="mt-2 text-sm text-ink-muted text-center">
            {data.property_name} · {data.room_name}
          </p>
          <p className="mt-4 text-sm text-ink-muted text-center">
            Para firmar el contrato, entra o crea una cuenta de inquilino.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href={`/login?next=${encodeURIComponent(next)}`}>
              <Button className="w-full">Entrar</Button>
            </Link>
            <Link href={`/register?next=${encodeURIComponent(next)}`}>
              <Button variant="outline" className="w-full">
                Crear cuenta inquilino
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <InvitationFlow data={data} profileEmail={profile.email} />;
}
