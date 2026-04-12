import Button from '@/ui/atoms/Button';
import Input from '@/ui/atoms/Input';
import Textarea from '@/ui/atoms/Textarea';
import Select from '@/ui/atoms/Select';
import Badge from '@/ui/atoms/Badge';
import Card from '@/ui/atoms/Card';
import { useThemeMode } from '@/hooks/useThemeMode';

const colorTokens = [
  { name: 'Primary', className: 'bg-primary', textClass: 'text-primary' },
  { name: 'Secondary', className: 'bg-secondary', textClass: 'text-secondary' },
  { name: 'Accent', className: 'bg-accent', textClass: 'text-accent' },
  { name: 'Success', className: 'bg-success', textClass: 'text-success' },
  { name: 'Warning', className: 'bg-warning', textClass: 'text-warning' },
  { name: 'Attention', className: 'bg-attention', textClass: 'text-attention' },
  { name: 'Danger', className: 'bg-danger', textClass: 'text-danger' },
];

const primitives = [
  { name: 'Brand 600', className: 'bg-brand-600' },
  { name: 'Brand 700', className: 'bg-brand-700' },
  { name: 'Brand 800', className: 'bg-brand-800' },
  { name: 'Brand 300', className: 'bg-brand-300' },
];

export default function DesignSystemPage() {
  const { mode, setMode } = useThemeMode();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="ds-shell overflow-hidden">
          <div className="grid gap-6 p-6 md:grid-cols-[1.7fr_1fr] md:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                Medsphere Design System
              </div>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
                Responsive, token-based UI foundation for web apps
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
                Atomic components, semantic colors, light and dark themes, and practical defaults ready for product screens.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary action</Button>
                <Button variant="secondary">Secondary action</Button>
                <Button variant="outline">Outline action</Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface/70 p-4 md:p-5">
              <img
                src="/medsphere-logo.png"
                alt="Medsphere logo"
                className="mx-auto h-auto w-full max-w-60 object-contain"
              />
              <div className="mt-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Theme mode</div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={mode === 'light' ? 'primary' : 'outline'} onClick={() => setMode('light')}>
                    Light
                  </Button>
                  <Button size="sm" variant={mode === 'dark' ? 'primary' : 'outline'} onClick={() => setMode('dark')}>
                    Dark
                  </Button>
                  <Button size="sm" variant={mode === 'system' ? 'primary' : 'outline'} onClick={() => setMode('system')}>
                    System
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Semantic Colors" description="Use these tokens in components and pages.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {colorTokens.map((token) => (
                <div key={token.name} className="rounded-xl border border-border p-3">
                  <div className={`h-9 rounded-md ${token.className}`} />
                  <div className={`mt-2 text-xs font-semibold ${token.textClass}`}>{token.name}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Brand Palette" description="Primitives for gradients, charts, and illustrations.">
            <div className="grid grid-cols-2 gap-3">
              {primitives.map((token) => (
                <div key={token.name} className="rounded-xl border border-border p-3">
                  <div className={`h-12 rounded-md ${token.className}`} />
                  <div className="mt-2 text-xs font-semibold text-muted-foreground">{token.name}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card title="Buttons" description="Atomic CTA styles with size and variant support.">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button>Medium</Button>
                <Button size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
              </div>
            </div>
          </Card>

          <Card title="Forms" description="Tokenized controls for consistent inputs across screens.">
            <div className="space-y-3">
              <Input label="Full name" placeholder="Dr. Lara Mitchell" hint="Name appears on prescriptions and profile." />
              <Select label="Department" defaultValue="cardiology">
                <option value="cardiology">Cardiology</option>
                <option value="neurology">Neurology</option>
                <option value="emergency">Emergency</option>
              </Select>
              <Textarea label="Notes" placeholder="Write patient notes..." />
            </div>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card
            title="Info Card"
            description="Good for dashboard widgets."
            footer={<Button variant="outline" size="sm">View details</Button>}
          >
            <p className="text-sm text-muted-foreground">
              Active patients today
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">128</p>
          </Card>

          <Card
            title="Appointment Card"
            description="Scheduling module reference style."
            footer={<Button variant="secondary" size="sm">Reschedule</Button>}
          >
            <div className="text-sm text-muted-foreground">Next appointment</div>
            <div className="mt-2 text-lg font-semibold">15:30 - MRI Check</div>
            <div className="mt-1 text-sm text-muted-foreground">Room 03, East Wing</div>
          </Card>

          <Card
            title="Alert Card"
            description="Use for status messaging."
            footer={<Badge variant="warning">Needs review</Badge>}
          >
            <div className="rounded-xl border border-attention/40 bg-attention/10 px-3 py-2 text-sm text-attention">
              New lab results were uploaded and are waiting for confirmation.
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
