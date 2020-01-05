import { Config } from './config.js'
import { Presets } from './presets.js'
import { Table } from './models/table.js'

const formatLength = d3.format('.1f')
// const aspectDINA = 210/297
// a bit tighter than a
const aspectDINA = 200/297

const buildMaterialTable = model => {
  const table = d3.select('#table-div')
    .append('table')
    .attr('class', 'material')

    const keys = Object.keys(model.lengths).sort()

  const content = [
    keys,
    keys.map(k => model.lengths[k].length),
    keys.map(k => model.lengths[k].count)
  ]

  const tr1 = table.append('tr')
  tr1.append('th')
  tr1.selectAll('th.name').data(content[0])
  .enter().append('th').text(d => d).attr('class',  'name')
  const tr2 = table.append('tr')
  tr2.append('th').text('Length')
  tr2.selectAll('td').data(content[1])
  .enter().append('td').text(d => formatLength(d))
  const tr3 = table.append('tr')
  tr3.append('th').text('Size')
  tr3.selectAll('td').data(content[2])
  .enter().append('td').text(d => d)
}

const buildInfoTable = model => {
  const table = d3.select('#table-div')
    .append('table')
    .attr('class', 'info')

  const now = new Date
  const content = [
    [now.toLocaleDateString()],
    [`${formatLength(model.length)} x ${formatLength(model.height)} x ${formatLength(model.width)}`],
    [`${formatLength(model.q1)} x ${formatLength(model.q2)}`]
  ]

  const tr1 = table.append('tr')
  tr1.append('th').text('1123xB')
  tr1.selectAll('th.name').data(content[0])
  .enter().append('td').text(d => d)
  const tr2 = table.append('tr')
  tr2.append('th').text('Size')
  tr2.selectAll('td').data(content[1])
  .enter().append('td').text(d => d)
  const tr3 = table.append('tr')
  tr3.append('th').text('Lath')
  tr3.selectAll('td').data(content[2])
  .enter().append('td').text(d => d)
}

const buildView = (model, svg, data, w, h) => {
  data.sort((a, b) => a.z - b.z)

  // const margin = { top: model.q2, right: model.q2, bottom: model.q2, left: model.q2 }
  const margin = { top: 0, right: 0, bottom: 0, left: 0 }
  const width = w + margin.left + margin.right
  const height = h + margin.top + margin.bottom

  svg.attr('viewBox', `0 0 ${width} ${height}`)

  const g = svg.select('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

  const sonst = data.filter(d => d.rotation)
  const laths = g.selectAll('.lath')
    .data(data)

  laths.enter().append('rect')
    .attr('class', 'lath')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', d => d.length)
    .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${180*d.rotation/Math.PI})`)
    .attr('height', model.q2)

  laths
    .attr('width', d => d.length)
    .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${180*d.rotation/Math.PI})`)

  laths.exit().remove()
}

const buildViewNew = (g, model, data) => {
  const laths = g.selectAll('.lath')
    .data(data.sort((a, b) => a.z - b.z))

  laths.enter().append('rect')
    .attr('class', 'lath')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', d => d.length)
    .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${180*d.rotation/Math.PI})`)
    .attr('height', model.q2)

  laths
    .attr('width', d => d.length)
    .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${180*d.rotation/Math.PI})`)

  laths.exit().remove()
}



export class Plan {
  constructor (config, element) {
    this.config = config
    this.element = element

    this.sideLeftSVG = d3.select('#plan-div')
      .append('svg')
      .attr('class', 'sideLeft')
    this.sideLeftSVG.append('g')

    this.boardSVG = d3.select('#plan-div')
      .append('svg')
      .attr('class', 'board')
    this.boardSVG.append('g')

    this.sideRightSVG = d3.select('#plan-div')
      .append('svg')
      .attr('class', 'sideRight')
    this.sideRightSVG.append('g')

    this.frontSVG = d3.select('#plan-div')
      .append('svg')
      .attr('class', 'front')
    this.frontSVG.append('g')

    this.svg = d3.select(this.element)
      .append('div')
      .attr('class', 'paper')
      .append('svg')
      .attr('class', 'construction-plan')

    this.render()
  }

  render () {
    // const model = new Table(this.config)

    // buildInfoTable(model)
    // buildMaterialTable(model)


    // const l = model.length + 2*model.q2
    // const w = model.width + 2*model.q2
    // const big = 100 * (l / (l + w))
    // const small = 100 * (w / (l + w))

    // const sideLeftLaths = model.parts['side-left'].laths
    // buildView(model, this.sideLeftSVG, sideLeftLaths, model.width, model.height)
    // this.sideLeftSVG.style('width', `${small}%`)

    // const boardLaths = model.parts.board.laths
    // buildView(model, this.boardSVG, boardLaths, model.length, model.width)
    // this.boardSVG.style('width', `${big}%`)

    // const sideRightLaths = model.parts['side-right'].laths
    // buildView(model, this.sideRightSVG, sideRightLaths, model.width, model.height)
    // this.sideRightSVG.style('width', `${small}%`)

    // const frontLaths = model.parts['keel'].laths
    // buildView(model, this.frontSVG, frontLaths, model.length, model.height)
    // this.frontSVG.style('width', `${big}%`)


    // ................................
    // : ---------------------------- :
    // : |  -----   --------------  | :
    // : | |     | |              | | :
    // : |  -----   --------------  | :
    // : |  -----   --------------  | :
    // : | |     | |              | | :
    // : | |     | |              | | :
    // : |  -----   --------------  | :
    // : ---------------------------- :
    // :...............................
    //
    // this.config.length = 200
    // this.config.height = 100
    // this.config.width = 80
    
    const modelNew = new Table(this.config)
    console.log(this.config, modelNew)
    const spacing = modelNew.q2
    const paper = {}

    // natural dimensions
    let viewWidth = 3*spacing + modelNew.width + modelNew.length
    let viewHeight = 3*spacing + modelNew.width + modelNew.height
    
    if (viewWidth >= viewHeight) {
      paper.orientation = 'landscape'
      if (viewHeight <= viewWidth*aspectDINA) {
        paper.fit = 'width'
        paper.width = viewWidth
        paper.height = viewWidth*aspectDINA
      } else {
        paper.fit = 'height'
        paper.height = viewHeight
        paper.width = viewHeight/aspectDINA
      }
    } else {
      paper.orientation = 'portrait'
      if (viewWidth < viewHeight*aspectDINA) {
        paper.fit = 'height'
        paper.height = viewHeight
        paper.width = viewHeight*aspectDINA
      } else {
        paper.fit = 'width'
        paper.width = viewWidth
        paper.height = viewWidth/aspectDINA
      }
    }
    console.log(paper)

    this.svg
      .attr('viewBox', `0 0 ${paper.width} ${paper.height}`)
    this.svg
      .append('rect')
      .attr('class', 'frameborder')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', paper.width)
      .attr('height', paper.height)

    const viewsG = this.svg
      .append('g')

    const sideG = viewsG
      .append('g')
      .attr('transform', `translate(${spacing}, ${2*spacing + modelNew.width}) rotate(180) translate(${-modelNew.width}, ${-modelNew.height})`)
    sideG
      .append('rect')
      .attr('class', 'outline')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', modelNew.width)
      .attr('height', modelNew.height)
    buildViewNew(sideG, modelNew, modelNew.parts['side-left'].laths)

    const topG = viewsG
      .append('g')
      .attr('transform', `translate(${2*spacing + modelNew.width}, ${spacing})`)
    topG
      .append('rect')
      .attr('class', 'outline')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', modelNew.length)
      .attr('height', modelNew.width)
    buildViewNew(topG, modelNew, modelNew.parts['board'].laths)

    const frontG = viewsG
      .append('g')
      .attr('transform', `translate(${2*spacing + modelNew.width}, ${2*spacing + modelNew.width})`)
      .attr('transform', `translate(${2*spacing + modelNew.width}, ${2*spacing + modelNew.width}) rotate(180) translate(${-modelNew.length}, ${-modelNew.height})`)
    frontG
      .append('rect')
      .attr('class', 'outline')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', modelNew.length)
      .attr('height', modelNew.height)
    buildViewNew(frontG, modelNew, modelNew.parts['keel'].laths)
  }
}
