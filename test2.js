import express from 'express';
import puppeteer from 'puppeteer';
const app = express();
app.listen(3002, () => console.log('Listening on 3002 with puppeteer'));
