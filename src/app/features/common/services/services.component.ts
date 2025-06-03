import { Component } from "@angular/core";
import { ServiceCardComponent } from "./components/service-card/service-card.component";

@Component({
  selector: "app-services",
  standalone: true,
  imports: [ServiceCardComponent],
  templateUrl: "./services.component.html",
})
export class ServicesComponent {
  public readonly services = [
    {
      icon: "map",
      title: "Georreferenciamento",
      description:
        "Serviços precisos de georreferenciamento utilizando tecnologia de ponta e profissionais especializados.",
    },
    {
      icon: "file-check",
      title: "Regularização",
      description:
        "Assessoria completa em regularização de propriedades rurais e urbanas, garantindo conformidade legal.",
    },
    {
      icon: "drone",
      title: "Aerolevantamento",
      description:
        "Levantamentos aéreos com drones de última geração para mapeamentos detalhados e precisos.",
    },
    {
      icon: "leaf",
      title: "Licenciamento Ambiental",
      description:
        "Suporte especializado em processos de licenciamento ambiental, desde o diagnóstico até a aprovação.",
    },
    {
      icon: "mountain",
      title: "Mineração",
      description:
        "Soluções completas para o setor de mineração, incluindo levantamentos e documentação técnica.",
    },
  ];

  public openWhatsApp(): void {
    const phoneNumber = "5531987824674";
    const message = encodeURIComponent(
      "Olá! Gostaria de mais informações sobre seus serviços. Poderia me ajudar?"
    );

    const url = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(url, "_blank"); 
  }
}
