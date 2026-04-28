import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'pray-stack',
  brand: {
    displayName: '프레이 스택',
    primaryColor: '#4A7C7E',
    icon: '',
  },
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'next dev',
      build: 'next build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
