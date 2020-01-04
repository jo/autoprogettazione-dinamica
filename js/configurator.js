const formatLength = d3.format('.1f')

export class Configurator {
  constructor (element, config, onupdate) {
    this.element = element
    this.config = config
    this.onupdate = onupdate

    this.form = d3.select(this.element)
      .append('form')
    
    const p1 = this.form.append('p')
    p1.append('label').text('Length')
    this.lengthInput = p1.append('input')
      .attr('type', 'number')
      .attr('name', 'length')
      .attr('step', '0.1')
      .attr('min', 0)
      .attr('value', formatLength(this.config.length))

    const p2 = this.form.append('p')
    p2.append('label').text('Width')
    this.widthInput = p2.append('input')
      .attr('type', 'number')
      .attr('name', 'width')
      .attr('step', '0.1')
      .attr('min', 0)
      .attr('value', formatLength(this.config.width))

    const p3 = this.form.append('p')
    p3.append('label').text('Height')
    this.heightInput = p3.append('input')
      .attr('type', 'number')
      .attr('name', 'height')
      .attr('step', '0.1')
      .attr('min', 0)
      .attr('value', formatLength(this.config.height))

    const p4 = this.form.append('p')
    p4.append('label').text('Lath')
    this.q1Input = p4.append('input')
      .attr('type', 'number')
      .attr('name', 'q1')
      .attr('min', 0)
      .attr('step', '0.1')
      .attr('disabled', true)
      .attr('value', formatLength(this.config.q1))
    this.q2Input = p4.append('input')
      .attr('type', 'number')
      .attr('name', 'q2')
      .attr('min', 0)
      .attr('step', '0.1')
      .attr('disabled', true)
      .attr('value', formatLength(this.config.q2))


    this.form.on('change', () => this.onchange())
  }

  update () {
    this.lengthInput.attr('value', formatLength(this.config.length))
    this.widthInput.attr('value', formatLength(this.config.width))
    this.heightInput.attr('value', formatLength(this.config.height))
    this.q1Input.attr('value', formatLength(this.config.q1))
    this.q2Input.attr('value', formatLength(this.config.q2))
  }

  onchange () {
    const key = d3.event.target.name
    const value = d3.event.target.value

    this.config[key] = value

    this.onupdate()
  }
}
