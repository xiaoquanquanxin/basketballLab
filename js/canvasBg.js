;(function (w) {
    window.Canv = function () {
        this.canvasStyle = document.createElement("style");
        this.el = document.createElement("canvas");
        this.el.id = "myCanvas";
        this.closeDistance = isMobile() ? 3110 : 10000;
        this.mouseMovePoint = {isUser: true};
        this.ctx = this.el.getContext("2d");
        this.count = isMobile() ? 50 : 100;
        this.timeSpace = isMobile() ? 60 : 40;
        this.init();
    };
    window.isMobile = function () {
        var ua = navigator.userAgent;
        var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        var isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
        var isAndroid = ua.match(/(Android)\s+([\d.]+)/);
        return isIphone || isAndroid
    };
    Canv.prototype.init = function () {
        var _this = this;
        this.canvasStyle.innerHTML = "html, body, #canvasWrap {  margin: 0;  padding: 0;  height: 100%;  width: 100%;  overflow: hidden;  }  #canvasWrap {position:absolute;z-index:-111;top:0;left:0;} canvas {  display: block;  }";
        document.head.appendChild(this.canvasStyle);
        this.el.width = this.width = canvasWrap.offsetWidth;
        this.el.height = this.height = canvasWrap.offsetHeight;
        document.addEventListener("touchstart", function (e) {
            _this.mouseMovePoint.x = e.clientX - e.target.offsetLeft;
            _this.mouseMovePoint.y = e.clientY - e.target.offsetTop;
            _this.mouseMovePoint.r = Math.sqrt(_this.closeDistance);
            _this.mouseMovePoint.g = 1.2;
        });
        document.addEventListener("touchmove", function (e) {
            _this.mouseMovePoint.x = e.touches[0].clientX - e.target.offsetLeft;
            _this.mouseMovePoint.y = e.touches[0].clientY - e.target.offsetTop;
        }, false);
        document.addEventListener("touchend", function (e) {
            delete  _this.mouseMovePoint.x;
            delete  _this.mouseMovePoint.y;
        }, false);
        this.animateTimer = null;
        this.pointArr = this.createPoints();
        this.animate();
    };
    Canv.prototype.createPoints = function () {
        var arr = [];
        for (var i = 0; i < this.count; i++) {
            arr[i] = this.createPointData();
        }
        return arr;
    };
    //  速度,方向
    Canv.prototype.createPointData = function () {
        var data = {};
        data.x = parseInt(Math.random() * this.width);
        data.y = parseInt(Math.random() * this.height);
        data.vx = this.randomFn(1, 4);
        data.vy = this.randomFn(1, 4);
        data.r = 0.4;
//        data.v = Math.sqrt((data.vx) * (data.vx) + (data.vy) * (data.vy));
        data.isXFoward = 1 - Math.random() * 2;
        data.isYFoward = 1 - Math.random() * 2;

        data.isInCircle = false;
        return data;
    };
    Canv.prototype.animate = function () {
        var _this = this;
        if (this.animateTimer) {
            clearTimeout(this.animateTimer);
        }
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.mainAnimate();
        this.animateTimer = setTimeout(function () {
            _this.animate();
        }, _this.timeSpace);
    };
    Canv.prototype.drawPoint = function (data) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "rgba(0,0,141,0.1)";
        this.ctx.arc(data.x, data.y, data.r, 0, 2 * Math.PI);
//        this.ctx.arc(data.x, data.y, data.r * data.g, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.closePath();
    };
    Canv.prototype.drawLine = function (a, b, close) {
        this.ctx.beginPath();
        this.ctx.moveTo(a.x, a.y);
        this.ctx.lineTo(b.x, b.y);
        this.ctx.lineWidth = Math.min(1, this.closeDistance * (a.isUser ? 0.3 : 0.08 ) / close);
        this.ctx.strokeStyle = "rgba(14,93,250," + Math.min(0.8, this.closeDistance * 0.5 / close) + ")";
        this.ctx.stroke();
        this.ctx.closePath();
    };
    Canv.prototype.mainAnimate = function () {
//        this.drawPoint(this.mouseMovePoint);
        for (var i = 0; i < this.pointArr.length; i++) {
            var poi = this.pointArr[i];
            if (poi.x + poi.vx * poi.isXFoward <= 0 || poi.x + poi.vx * poi.isXFoward >= this.width) {
                poi.isXFoward *= -1;
            }
            if (poi.y + poi.vy * poi.isYFoward <= 0 || poi.y + poi.vy * poi.isYFoward >= this.height) {
                poi.isYFoward *= -1;
            }
            this.drawPoint(this.pointArr[i]);
            for (var j = i + 1; j < this.pointArr.length; j++) {
                var poj = this.pointArr[j];
                //  是否足够接近
                var isClose = this.canLine(poj, poi);
                if (isClose < this.closeDistance) {
                    this.drawLine(poi, poj, isClose);
                }
            }
            var isMouseClose = this.canLine(poi, this.mouseMovePoint);
            //  监听位置
            if (isMouseClose < this.closeDistance * this.mouseMovePoint.g * this.mouseMovePoint.g) {
                this.drawLine(this.mouseMovePoint, poi, isMouseClose);
                //  判断是否首次进圈
                if (!poi.isInCircle) {
//                    console.log("进入监听位置");
                    var diffX = (poi.x - this.mouseMovePoint.x) * 0.95;
                    var diffY = (poi.y - this.mouseMovePoint.y) * 0.95;
                    poi.x = this.mouseMovePoint.x + diffX;
                    poi.y = this.mouseMovePoint.y + diffY;
                    poi.x = poi.x + poi.vx * poi.isXFoward;
                    poi.y = poi.y + poi.vy * poi.isYFoward;
                    if (isMouseClose <= this.closeDistance) {
//                        console.log("进圈了");
                        poi.isInCircle = true;
                    }
                } else {
//                    console.log("再次进圈");
                    var tempData = {};
                    tempData.x = poi.x + poi.vx * poi.isXFoward;
                    tempData.y = poi.y + poi.vy * poi.isYFoward;
                    //  当下一次就要出去了的时候
                    if (this.canLine(tempData, this.mouseMovePoint) > this.closeDistance) {
//                        console.log("当下一次就要出去了的时候");
                        var k = this.getK(this.mouseMovePoint, tempData);
                        var x = Math.sqrt((this.closeDistance  ) / (1 + k * k));
                        if (this.mouseMovePoint.x >= poi.x) {
                            x *= -1;
                        }
                        var y = k * x;
                        if (this.mouseMovePoint.y >= poi.y) {
                            y = Math.abs(y)
                        }
                        if (x > 0) {
                            x = Math.round(x) + 1;
                        } else {
                            x = Math.round(x) - 1;
                        }
                        if (y > 0) {
                            y = Math.round(y) + 1;
                        } else {
                            y = Math.round(y) - 1;
                        }
                        poi.x = this.mouseMovePoint.x + x;
                        poi.y = this.mouseMovePoint.y - y;
                    } else {
                        poi.x = poi.x + poi.vx * poi.isXFoward;
                        poi.y = poi.y + poi.vy * poi.isYFoward;
                    }
                }
            } else {
                poi.x = poi.x + poi.vx * poi.isXFoward;
                poi.y = poi.y + poi.vy * poi.isYFoward;
                poi.isInCircle = false;
            }

        }
    };
    Canv.prototype.canLine = function (a, b) {
        return Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2)
    };
    Canv.prototype.randomFn = function (min, max) {
        return parseInt(Math.random() * (max - min + 1) + min);
    };
    Canv.prototype.getK = function (a, b) {
        var k = -(a.y - b.y ) / (a.x - b.x );
        return k
    };
    var canvasWrap = w.document.getElementById("canvasWrap");
    canvasWrap.appendChild(new Canv().el);
}(window));