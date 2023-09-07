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


class Vis {
    #nodeRadiusLarge = 5;
    #nodeRadiusSmall = 1;

    #colors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"];
    #margin = {top: 15, bottom: 15, left:15, right:15};

    constructor(svgID, data) {
        this.svg = d3.select(svgID);
        this.layer1 = this.svg.append("g");

        this.points = data.data;
        this.projections = data.projections;
        this.cur_projection = this.projections[0];

        this.points.forEach((d,i) => d.id = i);

        this.updatePositions();
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

        this.layer1.selectAll("circle")
            .data(this.points, d => d.id)
            .join(
                enter => enter.append("circle")
                    .attr("class", "points")
                    .attr("cx", d => xscale(d.x))
                    .attr("cy", d => yscale(d.y))
                    .attr("r",  this.#nodeRadiusLarge)
                    .attr("fill", d => this.#colors[d.class[0]]),
                update => update
                    .attr("cx", d => xscale(d.x))
                    .attr("cy", d => yscale(d.y)),
                exit => exit.remove()
            );

    }



    test(){
        
        let newv = cart_to_pol(this.cur_projection[0]);
        newv.lat += 0.001;
        newv.long -= 0.01;

        this.cur_projection[0] = pol_to_cart(newv);

        let mag = magnitude(this.cur_projection[0]);
        this.cur_projection[0] = this.cur_projection[0].map(num => num / mag);

        let u2 = vectorSubtraction(this.cur_projection[1],projection_of_u_on_v(this.cur_projection[0],this.cur_projection[1]));
        let mag2 = magnitude(u2);
        this.cur_projection[1] = u2.map(num => num / mag2);

        console.log(newv);
        this.updatePositions();
        this.draw();
    }

}
