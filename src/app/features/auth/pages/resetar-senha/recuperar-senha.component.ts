import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-recuperar-senha',
  templateUrl: './recuperar-senha.component.html',
  styleUrls: ['./recuperar-senha.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
})
export class RecuperarSenhaComponent {
  recuperarForm: FormGroup;
  segundaEtapa = false;
  userID: number | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.recuperarForm = this.criarFormularioInicial();
  }

  criarFormularioInicial(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  criarFormularioSegundaEtapa(): FormGroup {
    return this.fb.group({
      codigo: ['', Validators.required],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]],
    });
  }

  enviar() {
    if (!this.segundaEtapa && this.recuperarForm.valid) {
      const email = this.recuperarForm.value.email;

      fetch(`${environment.apiUrl}/Users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(email),
      })
        .then(async (res) => {
          if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
          }
          return res.json();
        })
        .then((data) => {
          if (data.userID) {
            this.userID = data.userID;
            this.segundaEtapa = true;
            this.recuperarForm = this.criarFormularioSegundaEtapa();
          } else {
            alert('Resposta inesperada do servidor.');
          }
        })
        .catch((err) => {
          console.error('Erro ao enviar:', err);
          alert('Erro ao enviar e-mail de recuperação.');
        });
    } else if (
      this.segundaEtapa &&
      this.recuperarForm.valid &&
      this.userID !== null
    ) {
      const { codigo, novaSenha, confirmarSenha } = this.recuperarForm.value;

      if (novaSenha !== confirmarSenha) {
        alert('As senhas não coincidem.');
        return;
      }

      const payload = {
        newPassword: novaSenha,
        code: codigo,
      };

      this.http
        .post<any>(
          `${environment.apiUrl}/Users/verify-code/${this.userID}`,
          payload
        )
        .subscribe({
          next: (res) => {
            alert(res.mensagem || 'Senha redefinida com sucesso.');
          },
          error: () => {
            alert('Verifique o código digitado.');
          },
        });
    }
  }
}
