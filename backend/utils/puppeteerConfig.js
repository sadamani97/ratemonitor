export const getPuppeteerConfig = () => ({
  headless: 'shell',
  protocolTimeout: 60000,
  args: [
    '--no-sandbox', 
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-software-rasterizer',
    '--window-position=-2000,-2000'
  ]
});
