import { Color } from "p5";
import { mediumFontData, messenger, smallFontData } from "./app";
import { GlobalObserver, Message } from "./GlobalMessenger";
import { Translator } from './Translator';

export class StatusFeed implements GlobalObserver
{
  static MAX_LINES: number = 3;
  
  _feed: StatusLine[];

  init(): void
  {
    this._feed = new Array<StatusLine>();
    messenger.addObserver(this);
  }

  clear(): void
  {
    this._feed.length = 0;
  }

  onReceiveGlobalMessage(message: Message): void
  {

  }

  async publish(newLine: string, important: boolean = false): Promise<void> {
    const translator = Translator.getInstance();
    const translatedText = await translator.translate(newLine);
    let displayText = `${newLine}\n[译: ${translatedText}]`;
    
    this._feed.push(new StatusLine(displayText, important));

    if (this._feed.length > StatusFeed.MAX_LINES)
    {
      this._feed.splice(0, 1);
    }
  }
  
  render(): void
  {
    for (let i: number = 0; i < this._feed.length; i++)
    {
      if (!this._feed[i].draw(20, 30 + i * 45))
      {
        break; // break if the current line hasn't finished displaying
      }
    }
  }
}

export class StatusLine
{
  _line: string;
  _initTime: number;
  _displayTriggered: boolean = false;
  _lineColor: Color = color(0, 0, 100);

  static SPEED: number = 0.08;

  constructor(newLine: string, important: boolean)
  {
    this._line = newLine;

    if (important)
    {
      this._lineColor = color(100, 100, 100);
    }
  }

  draw(x: number, y: number): boolean
  {
    if (!this._displayTriggered)
    {
      this._initTime = millis();
      this._displayTriggered = true;
    }

    textAlign(LEFT);
    fill(this._lineColor);
    
    const lines = this._line.split('\n');
    let currentY = y;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 0) {
        textFont(mediumFontData);
        textSize(18);
      } else {
        textFont('SimSun', 16);
        x += 10;
        currentY += 5;
      }
      
      text(line.substring(0, min(line.length, this.getDisplayLength())), x, currentY);
      currentY += 20;
      
      if (i > 0) {
        x -= 10;
      }
    }
    
    textFont(smallFontData);
    return this._line.length <= this.getDisplayLength();
  }

  getDisplayLength(): number
  {
    return (int)((millis() - this._initTime) * StatusLine.SPEED);
  }
}