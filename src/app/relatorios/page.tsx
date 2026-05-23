'use client';

import { useState } from 'react';
import axios from 'axios';
import { Download, AlertCircle } from 'lucide-react';

export default function RelatoriosPage() {
  const [alunoId, setAlunoId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const alunosMock = [
    { id: '123e4567-e89b-12d3-a456-426614174000', nome: 'João Silva' },
    { id: '987fcdeb-51a2-43d7-9012-345678901234', nome: 'Maria Souza' }
  ];

  const handleDownloadPDF = async () => {
    setErro('');
    if (!alunoId || !dataInicio || !dataFim) {
      setErro('Por favor, preencha todos os campos antes de gerar o relatório.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`http://localhost:8080/api/relatorios/alunos/${alunoId}`, {
        params: {
          inicio: dataInicio,
          fim: dataFim
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_aluno_${alunoId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      setErro('Falha ao conectar com o servidor e gerar o PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
          Relatórios de Desempenho
        </h1>

        {erro && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            <p>{erro}</p>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecione o Aluno
            </label>
            <select
              value={alunoId}
              onChange={(e) => setAlunoId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Selecione um aluno...</option>
              {alunosMock.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={loading}
            className={`w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-medium transition-all ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            <Download size={20} />
            {loading ? 'Gerando PDF...' : 'Gerar e Baixar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}