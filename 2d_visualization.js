function magnitude(x){
    return Math.sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2]);
}

function innerProduct(x,y){
    return x[0]*y[0] + x[1]*y[1] + x[2]*y[2];
}

function projection_of_u_on_v(u,v){
    let alpha = this.innerProduct(v,u) / this.innerProduct(u,u);
    return u.map(el => el * alpha);
}

function scalar_x_vector(a,x){
    return x.map(u => a * u);
}

function vectorSubtraction(u,v){
    return u.map((el,i) => el-v[i]);
}

function cart_to_pol(v){
    let [x,y,z] = v;
    let r = magnitude(v);
    let long = Math.acos(x / Math.sqrt(x*x + y*y)) * (y < 0 ? -1 : 1);
    let lat = Math.acos(z / r);

    return {"r": r, "long": long, "lat": lat};
}

function pol_to_cart(v){
    let x = v.r * Math.sin(v.lat) * Math.cos(v.long);
    let y = v.r * Math.sin(v.lat) * Math.sin(v.long);
    let z = v.r * Math.cos(v.lat);
    return [x,y,z];
}

const colorScale = d3.scaleOrdinal(d3.range(9), d3.schemeCategory10);
const shapeScale = d3.scaleOrdinal(d3.range(9), d3.symbols.map(s => d3.symbol().type(s)));

class Vis2d {
    #nodeRadiusLarge = 5;
    #nodeRadiusSmall = 1;

    #colors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"];
    #margin = {top: 15, bottom: 15, left:15, right:15};

    constructor(svgID) {
        this.svg = d3.select(svgID);
        this.layer1 = this.svg.append("g");

    }



    newData(data, proj){
        this.points = data.data;
        this.projections = data.projections;
        this.updateProjection(proj);

        this.points.forEach((d,i) => d.id = `${data.name}_${i}`);

        this.updatePositions();
    }    

    updateProjection(proj){
        proj[0] = scalar_x_vector(1 / magnitude(proj[0]), proj[0]);
        proj[1] = scalar_x_vector(1 / magnitude(proj[1]), proj[1]);
        this.cur_projection = proj;

    }

    updatePositions(){
        this.points.forEach(d => {
            let image = this.project(this.cur_projection, d);
            d.x = image.x;
            d.y = image.y;
        });
    }

    project(A, x){
        let x1 = A[0][0] * x.x3 + A[0][1] * x.y3 + A[0][2] * x.z3;
        let x2 = A[1][0] * x.x3 + A[1][1] * x.y3 + A[1][2] * x.z3;
        return {"x": x1, "y": x2};
    }

    draw(){
        let xextent = d3.extent(this.points, d => d.x);
        let yextent = d3.extent(this.points, d => d.y);

        let width   = this.svg.node().getBoundingClientRect().width;
        let height  = this.svg.node().getBoundingClientRect().height;

        let xscale  = d3.scaleLinear().domain(xextent).range([this.#margin.left, width-this.#margin.right]); 
        let yscale  = d3.scaleLinear().domain(yextent).range([this.#margin.top, height - this.#margin.bottom]);

        this.layer1.selectAll(".points")
            .data(this.points, d => d.id)
            .join(
                enter => enter.append("path")
                    .attr("class", "points")
                    .attr("transform", d => `translate(${xscale(d.x)},${yscale(d.y)})`)
                    .attr("fill", d => colorScale(d.class[0]))
                    .attr("stroke", d => "grey")
                    .attr("opacity", 0.8)
                    .attr("d", d => shapeScale(d.class[1]).size(75)()), 
                update => update.attr("transform", d => `translate(${xscale(d.x)},${yscale(d.y)})`), 
                exit => exit.remove()
            );       

    }



}
