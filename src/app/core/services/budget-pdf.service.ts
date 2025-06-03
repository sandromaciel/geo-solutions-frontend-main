import { Injectable } from '@angular/core';
import { BudgetResponse } from '../models/budget/budget.model';
import jsPDF from 'jspdf';
import { logoBase64 } from './base64.service';
import { wappBase64 } from './base64.service';
import { instagramBase64 } from './base64.service';

@Injectable({
  providedIn: 'root',
})
export class BudgetPdfService {
  generatePdf(budget: BudgetResponse): void {
    try {
      const doc = new jsPDF();

      // Configurar margens
      const margin = 20;
      const imageWidth = 40;
      const imageHeight = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.addImage(
        logoBase64,
        'PNG',
        pageWidth - imageWidth - margin,
        15,
        imageWidth,
        imageHeight
      );

      // Data e destinatário
      const currentDate = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc.text(`Belo Horizonte, ${currentDate}`, margin, 40);
      doc.text(`A/C: ${budget.user?.email || 'Cliente'}`, margin, 48);

      // Título da proposta
      let y = 65;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('PROPOSTA TÉCNICA-COMERCIAL', margin, y);

      // Descrição do serviço solicitado
      y += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const serviceDescription = `Conforme solicitado, segue proposta técnica-comercial referente ao processo de ${
        budget.intentionService?.name || 'serviços topográficos'
      } localizado em ${budget.address.street}, ${budget.address.city} - ${
        budget.address.state
      }.`;

      const splitDescription = doc.splitTextToSize(
        serviceDescription,
        pageWidth - 2 * margin
      );
      doc.text(splitDescription, margin, y);
      y += splitDescription.length * 5 + 10;

      // Seção "A Empresa"
      doc.setFont('helvetica', 'bold');
      doc.text('1. A Empresa:', margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      const companyDesc =
        'Composta por profissionais capacitados e equipamentos homologados, estamos aptos a realizar os serviços oferecidos. Nosso objetivo é agregar valor no seu projeto e alcançar, juntos, o sucesso!';
      const splitCompanyDesc = doc.splitTextToSize(
        companyDesc,
        pageWidth - 2 * margin
      );
      doc.text(splitCompanyDesc, margin, y);
      y += splitCompanyDesc.length * 5 + 10;

      // Seção "Proposta Técnica"
      doc.setFont('helvetica', 'bold');
      doc.text('2. Proposta Técnica:', margin, y);
      y += 8;

      doc.text('2.1 Tipo de Serviço:', margin + 5, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.text(
        `${budget.intentionService?.name || 'Levantamento Topográfico'}`,
        margin + 10,
        y
      );
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('2.2 Descrição:', margin + 5, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      const technicalDesc =
        'Trata-se da realização de levantamento topográfico cadastral utilizando equipamentos de precisão, gerando documentação técnica completa conforme padrões municipais vigentes.';
      const splitTechnicalDesc = doc.splitTextToSize(
        technicalDesc,
        pageWidth - 2 * margin - 10
      );
      doc.text(splitTechnicalDesc, margin + 10, y);
      y += splitTechnicalDesc.length * 5 + 8;

      // Seção "Investimento"
      doc.setFont('helvetica', 'bold');
      doc.text('3. Investimento:', margin, y);
      y += 8;

      doc.text('Serviços: Itens 2.1, 2.2', margin + 5, y);
      y += 8;

      const formattedPrice = Number(budget.price).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      doc.setFontSize(12);
      doc.text(`Total: ${formattedPrice}`, margin + 5, y);
      y += 15;

      // Informações importantes
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Informações Importantes:', margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.text(
        '• Entrada de 50% no início dos trabalhos e 50% na entrega dos arquivos.',
        margin,
        y
      );
      y += 5;
      doc.text('• Disponibilidade para início imediato.', margin, y);
      y += 5;
      doc.text(
        '• Esta Proposta Comercial tem prazo de validade de 30 dias.',
        margin,
        y
      );
      y += 5;
      doc.text(
        '• Não estão inclusos custos, taxas e emolumentos de terceiros.',
        margin,
        y
      );
      y += 5;
      doc.text(
        '• Os prazos podem sofrer alterações devido a condições climáticas.',
        margin,
        y
      );
      y += 15;

      // Verificar se precisa de nova página
      if (y > pageHeight - 50) {
        doc.addPage();
        y = 30;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const atenciosamente = 'Atenciosamente,';
      const atenciosamenteWidth = doc.getTextWidth(atenciosamente);
      doc.text(atenciosamente, (pageWidth - atenciosamenteWidth) / 2, y - 10); // 10 acima do nome

      // Centralizar "Gustavo Ribeiro"
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      const name = 'Gustavo Ribeiro';
      const nameWidth = doc.getTextWidth(name);
      doc.text(name, (pageWidth - nameWidth) / 2, y);
      y += 5;

      // Adiciona linha com WhatsApp, e-mail e Instagram com ícones
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      const whatsappText = '(31) 3058-2961';
      const emailText = 'contato@geosolucoes.com';
      const instaText = '@geo_solucoes';

      const separator = ' | ';
      const sepWidth = doc.getTextWidth(separator);

      const whatsappWidth = doc.getTextWidth(whatsappText);
      const emailWidth = doc.getTextWidth(emailText);
      const instaWidth = doc.getTextWidth(instaText);

      const iconSize = 5; // em mm
      const spacing = 2; // espaço entre ícone e texto

      // Largura total do conteúdo
      const totalWidth =
        iconSize +
        spacing +
        whatsappWidth +
        sepWidth +
        emailWidth +
        sepWidth +
        iconSize +
        spacing +
        instaWidth;

      // Ponto de início X para centralizar tudo
      let x = (pageWidth - totalWidth) / 2;

      // Y base para o texto
      const iconY = y - iconSize + 2; // alinhamento vertical ícone/texto

      // WhatsApp ícone
      doc.addImage(wappBase64, 'PNG', x, iconY, iconSize, iconSize);
      x += iconSize + spacing;

      // WhatsApp texto
      doc.text(whatsappText, x, y);
      x += whatsappWidth;

      // Separador
      doc.text(separator, x, y);
      x += sepWidth;

      // Email (sem ícone)
      doc.text(emailText, x, y);
      x += emailWidth;

      // Separador
      doc.text(separator, x, y);
      x += sepWidth;

      // Instagram ícone
      doc.addImage(instagramBase64, 'PNG', x, iconY, iconSize, iconSize);
      x += iconSize + spacing;

      // Instagram texto
      doc.text(instaText, x, y);

      // Gerar e abrir PDF
      const pdfOutput = doc.output('blob');
      const url = window.URL.createObjectURL(pdfOutput);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Falha ao gerar o PDF. Tente novamente.');
    }
  }
}
