export class Config {
  constructor ({ title, q1, q2, length, height, width }) {
    this.title = title
    
    this.q1 = q1
    this.q2 = q2
    
    this.length = length
    this.height = height
    this.width = width
  }

  toJSON () {
    return {
      title: this.title,
      q1: this.q1,
      q2: this.q2,
      length: this.length,
      height: this.height,
      width: this.width
    }
  }
}
