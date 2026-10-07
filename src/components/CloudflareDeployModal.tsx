import React, { useState } from 'react';
import {
  CloudLightning,
  GitBranch,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Shield,
  Layers,
} from 'lucide-react';
import { playCyberClick, playCyberSuccess } from '../utils/audio';

interface CloudflareDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareDeployModal: React.FC<CloudflareDeployModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    playCyberSuccess();
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const githubWorkflowYaml = `name: Deploy to Cloudflare Pages CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Build & Deploy to Cloudflare Pages
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Application Asset
        run: npm run build
        env:
          NODE_ENV: production

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: 'cyber-roadmap-si'
          directory: 'dist'
          gitHubToken: \${{ secrets.GITHUB_TOKEN }}
`;

  const wranglerToml = `name = "cyber-roadmap-si"
compatibility_date = "2026-10-01"

[site]
bucket = "./dist"

[env.production.vars]
ENVIRONMENT = "production"
APP_TITLE = "CYBER//ROADMAP - Academic & Career Matrix Sistem Informasi"
`;

  const gitCommands = `# 1. Inisialisasi Git di lokal direktori Anda
git init
git add .
git commit -m "feat: initial commit CYBER//ROADMAP Sistem Informasi"

# 2. Hubungkan ke Remote GitHub Anda
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/cyber-roadmap-si.git

# 3. Push ke GitHub (CI/CD Otomatis akan Trigger!)
git push -u origin main
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#090d16] border border-[#ff007f] rounded-xl max-w-3xl w-full p-6 cyber-box-pink relative my-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded bg-[#ff007f]/20 border border-[#ff007f] text-[#ff007f]">
              <CloudLightning className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-mono text-[#ff007f] font-bold">
                DEVOPS AUTOMATION // FULL CD & CI/CD PIPELINE
              </span>
              <h2 className="text-lg sm:text-xl font-cyber font-bold text-white mt-0.5">
                Panduan Deploy GitHub & Cloudflare Pages Otomatis
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              playCyberClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white font-mono p-1"
          >
            [TUTUP]
          </button>
        </div>

        <div className="mt-5 space-y-6 text-xs font-mono">
          {/* Step 1: GitHub Actions Workflow */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-200 font-bold flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-[#00ff9d] text-black font-extrabold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Buat File: .github/workflows/deploy-cloudflare.yml</span>
              </span>
              <button
                onClick={() => copyToClipboard(githubWorkflowYaml, 'workflow')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-black border border-white/20 text-[#00ff9d] hover:bg-[#00ff9d]/20 transition-colors"
              >
                {copiedSection === 'workflow' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>TERSALIN!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>SALIN WORKFLOW YAML</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-black rounded border border-white/10 text-slate-300 overflow-x-auto text-[11px] leading-relaxed max-h-48">
              {githubWorkflowYaml}
            </pre>
          </div>

          {/* Step 2: Cloudflare Wrangler Config */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-200 font-bold flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-[#00e5ff] text-black font-extrabold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Buat File Konfigurasi: wrangler.toml</span>
              </span>
              <button
                onClick={() => copyToClipboard(wranglerToml, 'wrangler')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-black border border-white/20 text-[#00e5ff] hover:bg-[#00e5ff]/20 transition-colors"
              >
                {copiedSection === 'wrangler' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>TERSALIN!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>SALIN WRANGLER.TOML</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-black rounded border border-white/10 text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
              {wranglerToml}
            </pre>
          </div>

          {/* Step 3: GitHub Secrets Configuration */}
          <div className="bg-black/60 p-4 rounded-lg border border-white/10">
            <h4 className="text-slate-200 font-bold flex items-center space-x-2 text-xs">
              <span className="w-5 h-5 rounded bg-amber-400 text-black font-extrabold flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Atur Secrets di GitHub Repository Anda:</span>
            </h4>
            <p className="text-slate-400 mt-1">
              Buka menu <strong>Repository Settings &gt; Secrets and variables &gt; Actions</strong>, lalu tambahkan 2 rahasia:
            </p>
            <div className="mt-2.5 space-y-2">
              <div className="bg-black p-2.5 rounded border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[#00ff9d] font-bold">CLOUDFLARE_API_TOKEN</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Didapat dari Cloudflare Dashboard &gt; My Profile &gt; API Tokens &gt; Create Token (Template: Edit Cloudflare Pages).
                  </p>
                </div>
              </div>
              <div className="bg-black p-2.5 rounded border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[#00e5ff] font-bold">CLOUDFLARE_ACCOUNT_ID</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Didapat dari Cloudflare Dashboard di URL browser atau halaman overview Workers &amp; Pages.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Terminal Command push */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-200 font-bold flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-purple-400 text-black font-extrabold flex items-center justify-center text-[10px]">
                  4
                </span>
                <span>Jalankan di Terminal / Command Prompt:</span>
              </span>
              <button
                onClick={() => copyToClipboard(gitCommands, 'git')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-black border border-white/20 text-purple-300 hover:bg-purple-500/20 transition-colors"
              >
                {copiedSection === 'git' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>TERSALIN!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>SALIN PERINTAH GIT</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-black rounded border border-white/10 text-[#00ff9d] overflow-x-auto text-[11px] leading-relaxed">
              {gitCommands}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <span className="text-slate-400">
            Setiap commit ke branch <code>main</code> akan otomatis melakukan build &amp; deploy ke edge network Cloudflare Pages di seluruh dunia!
          </span>
          <button
            onClick={() => {
              playCyberClick();
              onClose();
            }}
            className="px-5 py-2 rounded bg-[#ff007f] text-white font-bold hover:bg-[#ff007f]/80 transition-colors shrink-0"
          >
            SAYA MENGERTI
          </button>
        </div>
      </div>
    </div>
  );
};
