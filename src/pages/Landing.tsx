import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Shield, Users, Timer, Trophy, Swords, Eye } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>HeroClix Battle - Overlay e Game Track Online</title>
        <meta
          name="description"
          content="O overlay e game track ideal para seus jogos de HeroClix. Sistema completo com timer, gerenciamento de times, partidas online e muito mais."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
        {/* Hero Section */}
        <header className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-6xl md:text-8xl font-black uppercase text-accent text-stroke mb-6 animate-fade-in">
            HeroClix Battle
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-foreground/90 mb-8">
            Overlay e Game Track Online
          </p>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            O sistema ideal para gerenciar suas partidas de HeroClix com timer sincronizado,
            gerenciamento de times, sistema de pontuação e muito mais!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-black text-xl h-14 px-8"
            >
              Jogar Agora
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="border-2 border-accent/50 font-bold text-lg h-14 px-8"
            >
              Saiba Mais
            </Button>
          </div>
        </header>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase text-center mb-12 text-accent">
            Recursos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Users className="w-12 h-12" />}
              title="Partidas Online"
              description="Crie partidas públicas ou privadas e jogue com amigos de qualquer lugar do mundo."
            />
            <FeatureCard
              icon={<Timer className="w-12 h-12" />}
              title="Timer Sincronizado"
              description="Timer de 50 minutos sincronizado em tempo real entre todos os jogadores."
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12" />}
              title="Gerenciamento de Times"
              description="Salve seus times favoritos e importe direto do HCUnits.net"
            />
            <FeatureCard
              icon={<Trophy className="w-12 h-12" />}
              title="Sistema de Pontuação"
              description="Acompanhe pontos de vitória e pontos totais automaticamente."
            />
            <FeatureCard
              icon={<Swords className="w-12 h-12" />}
              title="Unidades Vinculadas"
              description="Sistema completo de equipamentos, avatares e outras unidades anexadas."
            />
            <FeatureCard
              icon={<Eye className="w-12 h-12" />}
              title="Modo Espectador"
              description="Assista partidas ao vivo de outros jogadores."
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase text-center mb-12 text-accent">
            Como Funciona
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            <Step
              number="1"
              title="Crie sua Conta"
              description="Faça login ou cadastre-se gratuitamente para começar a jogar."
            />
            <Step
              number="2"
              title="Entre no Lobby"
              description="Crie uma nova partida ou entre em uma existente como jogador ou espectador."
            />
            <Step
              number="3"
              title="Monte seu Time"
              description="Crie um time do zero, selecione um salvo ou importe do HCUnits.net"
            />
            <Step
              number="4"
              title="Jogue e Vença!"
              description="Gerencie suas unidades, acompanhe pontos e use o timer sincronizado."
            />
          </div>
        </section>

        {/* Demo Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase text-center mb-12 text-accent">
            Demo Interativa
          </h2>
          <div className="max-w-6xl mx-auto bg-card/50 border-2 border-accent/30 rounded-xl p-8">
            <p className="text-center text-lg text-muted-foreground mb-6">
              Experimente o sistema de gerenciamento de times abaixo:
            </p>
            <div className="aspect-video bg-background/50 rounded-lg border-2 border-accent/20 flex items-center justify-center">
              <p className="text-muted-foreground text-lg">
                [Demo será implementada aqui com todas as funcionalidades]
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-black uppercase mb-6 text-accent">
            Pronto para Começar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Junte-se à comunidade HeroClix Battle agora!
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-black text-xl h-14 px-12"
          >
            Criar Conta Grátis
          </Button>
        </section>

        {/* Footer */}
        <footer className="border-t border-accent/20 py-8">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>© 2025 HeroClix Battle. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-card/80 p-6 rounded-xl border-2 border-accent/30 hover:border-accent/60 transition-all hover:scale-105">
    <div className="text-accent mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const Step = ({ number, title, description }: { number: string; title: string; description: string }) => (
  <div className="flex gap-6 items-start">
    <div className="flex-shrink-0 w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-black text-xl">
      {number}
    </div>
    <div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-lg">{description}</p>
    </div>
  </div>
);

export default Landing;