/*jslint browser: true, this */
/*global window, FileReader */

var drawing = {};
var tools = {};
var mouse = {};
var palette = [];

var myPaint = function () {
    "use strict";
    document.addEventListener("DOMContentLoaded", function () {
        drawing.all = [];
        tools.current = 'pencil';

        var body = document.body;
        var container = document.createElement('div');
        container.setAttribute('id', 'container');
        container.style.cursor = 'pointer';
        body.appendChild(container);

        var create = function (ele, idl, parent, classe, w, h, typ) {
            var element = document.createElement(ele);
            element.setAttribute('id', idl);
            element.setAttribute('class', classe);
            if (ele === 'canvas') {
                element.setAttribute('height', h);
                element.setAttribute('width', w);
            } else {
                if (h && w) {
                    element.style.height = h;
                    element.style.width = w;
                }
            }
            if (ele === 'input') {
                element.setAttribute('type', typ);
            }
            if (parent) {
                parent.appendChild(element);
            }
            return element;
        };

    // ******************** CREATE CANVAS && RETURN CURRENT CONTEXT **********************
        var create_canvas = function (id, h, w, ctx, all) {
            var canvas = create('canvas', id, container, 'canvas', w, h);
            ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#000';
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.lineWidth = 5;
            ctx.canvas.style.position = 'absolute';
            ctx.canvas.style.border = '1px solid black';
            ctx.canvas.style.boxShadow = '2px 2px 2px #111';

            if (ctx.canvas.id.substring(0, 5) === 'paint') {
                all.push(ctx);
            }
            return ctx;
        };
        var draw = function (x, y, xto, yto, ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(xto, yto);
            ctx.stroke();
            return ctx;
        };
        var rectangle = function (x, y, w, h, full) {
            drawing.ctx.beginPath();
            drawing.ctx.rect(x, y, w, h);
            if (full === true) {
                drawing.ctx.fill();
            }
            drawing.ctx.stroke();
        };
        var axerectangle = function (x, y, x2, y2, dx, dy, w, h, bol) {
            rectangle(x, y, dx, dy, bol);
            if (document.getElementById('vertical')) {
                rectangle(x2, y, w, dy, bol);
            }
            if (document.getElementById('horizontal')) {
                rectangle(x, y2, dx, h, bol);
            }
            if (document.getElementById('horizontal') && document.getElementById('vertical')) {
                rectangle(x2, y2, w, h, bol);
            }
        };
        var circle = function (x, y, radius, full) {
            drawing.ctx.beginPath();
            drawing.ctx.arc(x, y, Math.sqrt(radius), 0, 2 * Math.PI, false);
            if (full === true) {
                drawing.ctx.fill();
            }
            drawing.ctx.stroke();
        };

        var axecircle = function (x, y, x2, y2, r, bol) {
            circle(x, y, r, bol);
            if (document.getElementById('vertical')) {
                circle(x2, y, r, bol);
            }
            if (document.getElementById('horizontal')) {
                circle(x, y2, r, bol);
            }
            if (document.getElementById('horizontal') && document.getElementById('vertical')) {
                circle(x2, y2, r, bol);
            }
        };

    // ******************** TOOLSBOX **********************

        var toolsbox = function (id, h, w, name, toolbox) {
            var box = create('div', id, null, 'box', w, h);
            toolbox = box;
            body.appendChild(toolbox);

            var label_name = name;
            var label = document.createElement('div');
            label.setAttribute('class', 'label');
            var i = 0;
            while (label_name[i]) {
                label.innerHTML += '<span>' + label_name[i] + '</span>';
                i += 1;
            }
            toolbox.appendChild(label);
            return toolbox;
        };

      // ******************** BUTTON ICON **********************

        var iconButton = function (icon, id, box, path) {
            icon = document.createElement('button');
            icon.setAttribute('id', id);
            icon.setAttribute('class', 'tools');
            icon.style.background = 'url(' + path + ') center no-repeat';
            icon.style.backgroundSize = '25px, 25px';
            icon.style.backgroundColor = 'lightgray';
            icon.style.borderRadius = '5px';
            box.appendChild(icon);
            return icon;
        };
        var clonectx = function (id) {
            var canvas = document.getElementById(id);
            var ctx = canvas.getContext('2d');
            ctx.strokeStyle = drawing.ctx.strokeStyle;
            ctx.lineWidth = drawing.ctx.lineWidth;
            ctx.globalCompositeOperation = drawing.ctx.globalCompositeOperation || '';
            return ctx;
        };
        var symetrie_tracer = function (orientation) {
            if (document.getElementById('vertical') || document.getElementById('horizontal')) {
                document.getElementById('add').click();
            }
            var htrace = drawing.ctx.canvas.height;
            var wtrace = drawing.ctx.canvas.width;
            var Top = drawing.ctx.canvas.offsetTop;
            var Left = drawing.ctx.canvas.offsetLeft;
            var context = drawing.ctx.canvas.getContext('2d');
            var ctx = create_canvas(orientation, htrace, wtrace, context, drawing.all);
            ctx.canvas.style.top = Top + 'px';
            ctx.canvas.style.left = Left + 'px';
            ctx.lineWidth = 1;
            if (orientation === 'vertical') {
                draw(wtrace / 2, 0, wtrace / 2, htrace, ctx);
                mouse.xmiddle = Left + wtrace / 2;
            } else if (orientation === 'horizontal') {
                draw(0, htrace / 2, wtrace, htrace / 2, ctx);
                mouse.ymiddle = Top + htrace / 2;
            }
            ctx.canvas.style.zIndex = -5000000;
            document.getElementById('add').click();
            return ctx;
        };
        var hsl = function (h, s, l) {
            return 'hsl(' + h.toString() + ',' + s.toString() + '%,' + l.toString() + '%)';
        };
        var colorStripe = function (box, h, w, objEvents) {
            var canvasStripe = create('canvas', 'colorStripe', box, null, w, h);
            var ctx = canvasStripe.getContext('2d');
            var stripes = parseInt(canvasStripe.height) / 360;
            var tint = 0;
            while (tint <= 360) {
                ctx.fillStyle = "hsl(" + tint.toString() + ", 100%, 50%)";
                ctx.fillRect(0, tint * stripes, canvasStripe.width, stripes);
                tint += 1;
            }
            var arrEvents = Object.keys(objEvents);
            var i = arrEvents.length - 1;
            while (i >= 0) {
                canvasStripe.addEventListener(arrEvents[i], objEvents[arrEvents[i]]);
                i -= 1;
            }
            return ctx;
        };
        var colorPicker = function (box, h, w, objEvents) {
            var canvasPicker = create('canvas', 'colorPicker', box, null, w, h);
            var arrEvents = Object.keys(objEvents);
            var i = arrEvents.length - 1;
            while (i >= 0) {
                canvasPicker.addEventListener(arrEvents[i], objEvents[arrEvents[i]]);
                i -= 1;
            }
        };
        colorPicker.prototype.color = function (tint) {
            var canvas = document.getElementById('colorPicker');
            var ctx = canvas.getContext('2d');
            var pixelWidth = parseInt(canvas.width) / 100;
            var pixelHeight = parseInt(canvas.height) / 100;
            var lum = 100;
            var sat = 0;
            while (lum >= 0) {
                sat = 0;
                while (sat <= 100) {
                    ctx.fillStyle = hsl(tint || 0, sat, lum);
                    ctx.fillRect(sat * pixelWidth, lum * pixelHeight, pixelWidth, pixelHeight);
                    sat += 1;
                }
                lum -= 1;
            }
            return this;
        };
        var removerall = function (id, parent) {
            var color = document.querySelectorAll(id);
            var nb = color.length;
            var j = 0;
            if (nb !== 0) {
                while (j < nb) {
                    document.getElementById(parent).removeChild(color[j]);
                    j += 1;
                }
            }
        };
        var setPalette = function () {
            removerall('.colors', 'colorpalette');
            var count = palette.length;
            var canvas;
            var i = 0;
            while (i < count) {
                canvas = create('canvas', i, null, 'colors', 40, 40);
                canvas.style.background = palette[i];
                document.getElementById('colorpalette').appendChild(canvas);
                i += 1;
            }
        };
        var remover = function (id) {
            var element = document.getElementById(id);
            if (element) {
                return element.parentNode.removeChild(element);
            }
        };
        var clear = function (idctx) {
            return idctx.clearRect(0, 0, idctx.canvas.width, drawing.ctx.canvas.height);
        };
        var exiter = function (id, parent) {
            var exit = document.createElement('img');
            exit.setAttribute('id', id);
            exit.src = 'img/exit.png';
            parent.appendChild(exit);
            exit.style.zIndex = 10000;
        };

      // ******************** INITIALISATION **********************

        drawing.ctx = create_canvas('paint_0', body.scrollHeight || 960, body.scrollWidth, drawing.ctx, drawing.all);
        drawing.ctx.canvas.style.top = '0px';

        var colorpalette = create('div', 'colorpalette', body);
        exiter('exit_colorpalette', colorpalette);

        var tracers = create('id', 'tracers', body);
/*        var infos = create('id', 'tracerinfos', body);;
*/
        exiter('exit_tracers', tracers);

        var menu = null;
        var colors = null;
        var shape = null;
        var firstclick = false;
        var boxmenu = toolsbox('boxmenu', '130px', '170px', 'MENU', menu);
        var boxcolor = toolsbox('boxcolor', '180px', '220px', 'COLOR', colors);
        var boxshape = toolsbox('boxshape', '150px', '170px', 'SHAPE', shape);
        tools.pencil = iconButton(tools.pencil, 'pencil', boxshape, 'img/pencil.png');
        tools.catch = iconButton(tools.catch, 'catch', boxshape, 'img/catch.png');
        tools.erase = iconButton(tools.erase, 'erase', boxshape, 'img/erase.png');
        tools.clear = iconButton(tools.clear, 'clear', boxshape, 'img/clear.png');
        tools.line = iconButton(tools.line, 'line', boxshape, 'img/line.png');
        tools.circle = iconButton(tools.circle, 'circle', boxshape, 'img/circle.png');
        tools.circlefull = iconButton(tools.circlefull, 'circlefull', boxshape, 'img/circlefull.png');
        tools.rectangle = iconButton(tools.rectangle, 'rectangle', boxshape, 'img/rectangle.png');
        tools.rectanglefull = iconButton(tools.rectanglefull, 'rectanglefull', boxshape, 'img/rectanglefull.png');
        tools.axeh = iconButton(tools.axeh, 'axeh', boxshape, 'img/axeh.png');
        tools.axev = iconButton(tools.axev, 'axev', boxshape, 'img/axev.png');
        tools.save = iconButton(tools.save, 'save', boxmenu, 'img/save.png');
        tools.add = iconButton(tools.add, 'add', boxmenu, 'img/add.png');
        tools.compile = iconButton(tools.compile, 'compile', boxmenu, 'img/compile.png');
        tools.palette = iconButton(tools.palette, 'palette', boxshape, 'img/color.png');
        tools.colorpalette = document.getElementById('colorpalette');
        tools.infos = iconButton(tools.infos, 'infos', boxmenu, 'img/infos.png');
        tools.tracers = document.getElementById('tracers');

        // ******************** INPUT - THICKNESS - FILE **********************

        tools.thinck = document.createElement('input');
        tools.thinck.setAttribute('id', 'thinckness');
        tools.thinck.setAttribute('type', 'range');
        tools.thinck.setAttribute('min', '0');
        tools.thinck.setAttribute('max', '100');
        tools.thinck.setAttribute('value', drawing.ctx.lineWidth);
        boxshape.appendChild(tools.thinck);

        var div_upload = create('div', 'image_upload', boxmenu, 'tools');
        tools.upload = create('input', 'upload', div_upload, null, null, null, 'file');
        /*var valheight = create('input', 'height', tools.tracerinfos, null, null, null, 'text');
        var valwidth = create('input', 'width', tools.tracerinfos, null, null, null, 'text');*/

        var labelfile = document.createElement('label');
        labelfile.setAttribute('for', 'upload');
        labelfile.style.backgroundColor = 'lightgray';
        labelfile.style.borderRadius = '5px';
        div_upload.appendChild(labelfile);

        var image_upload = document.createElement('img');
        image_upload.src = 'img/upload.png';
        image_upload.style.backgroundPosition = 'center';
        image_upload.style.backgroundColor = 'lightgray';
        image_upload.style.borderRadius = '5px';
        labelfile.appendChild(image_upload);

        var color_selected = false;
        colorStripe(boxcolor, '150px', '30px', {
            'mousemove': function (e) {
                if (!color_selected) {
                    var tint = 360 * (e.pageY - this.offsetTop - this.parentNode.offsetTop) / this.height;
                    tools.colorPicker.color(tint);
                    tools.tint = tint;
                }
            },
            'mouseup': function (e) {
                color_selected = true;
                var tint = 360 * (e.pageY - this.offsetTop - this.parentNode.offsetTop) / this.height;
                drawing.ctx.strokeStyle = hsl(tint, 100, 50);
                drawing.ctx.fillStyle = hsl(tint, 100, 50);
            },
            'mouseout': function () {
                color_selected = false;
            }
        });
        tools.colorStripe = Object.create(colorStripe.prototype);

        colorPicker(boxcolor, '150px', '150px', {
            'mouseup': function (e) {
                var sat = e.pageX - this.offsetLeft - this.parentNode.offsetLeft;
                var lum = e.pageY - this.offsetTop - this.parentNode.offsetTop;
                var color = hsl(tools.tint || 0, sat, lum);
                drawing.ctx.strokeStyle = color;
                drawing.ctx.fillStyle = color;
                if (palette.length === 64) {
                    palette.pop();
                }
                palette.push(color);
                setPalette();
            }
        });
        tools.colorPicker = Object.create(colorPicker.prototype);
        tools.colorPicker.color(0);

        // ******************** EVENEMENTS-BUTTON-SHAPE **********************

        tools.clear.addEventListener('click', function () {
            clear(drawing.ctx);
        });
        tools.thinck.addEventListener('click', function (e) {
            drawing.ctx.lineWidth = e.target.valueAsNumber;
        });
        tools.erase.addEventListener('click', function () {
            tools.current = 'erase';
        });
        tools.pencil.addEventListener('click', function () {
            tools.current = 'pencil';
        });
        tools.line.addEventListener('click', function () {
            tools.current = 'line';
            firstclick = false;
        });
        tools.circle.addEventListener('click', function () {
            tools.current = 'circle';
            firstclick = false;
        });
        tools.circlefull.addEventListener('click', function () {
            tools.current = 'circlefull';
            firstclick = false;
        });
        tools.rectangle.addEventListener('click', function () {
            tools.current = 'rectangle';
            firstclick = false;
        });
        tools.rectanglefull.addEventListener('click', function () {
            tools.current = 'rectanglefull';
            firstclick = false;
        });
        tools.catch.addEventListener('click', function () {
            tools.current = 'catch';
            drawing.ctx.canvas.draggable = true;
        });
        tools.colorpalette.addEventListener('dblclick', function (e) {
            e.preventDefault();
            palette.splice(e.target.id, 1);
            setPalette();
        });
        tools.colorpalette.addEventListener('click', function (e) {
            if (document.getElementById('colorpalette')) {
                var color = document.getElementById(e.target.id).style.backgroundColor;
                drawing.ctx.strokeStyle = color;
                e.preventDefault();
            }
        });
        tools.palette.addEventListener('click', function () {
            tools.colorpalette.style.display = 'block';
        });
        document.getElementById('exit_colorpalette').addEventListener('click', function () {
            tools.colorpalette.style.display = 'none';
        });
        tools.infos.addEventListener('click', function () {
            removerall('.prewiew', 'tracers');
            var count = drawing.all.length;
            var i = 0;
            var can;
            var ctx;
            var ctxa;
            var h;
            var w;
            var id;
            while (i < count) {
                id = drawing.all[i].canvas.id;
                can = document.getElementById(id);
                ctxa = can.getContext('2d');
                h = parseInt(ctxa.canvas.height);
                w = parseInt(ctxa.canvas.width);
                ctx = create_canvas('c' + id, h, w, ctx, drawing.all);
                ctx.drawImage(can, 0, 0);
                ctx.canvas.className = 'prewiew';
                ctx.canvas.style.height = '100px';
                ctx.canvas.style.width = '100px';
                ctx.canvas.style.position = 'relative';
                tools.tracers.appendChild(ctx.canvas);
                i += 1;
            }
            tools.tracers.style.display = 'block';
            return ctx;
        });
        document.getElementById('exit_tracers').addEventListener('click', function () {
            tools.tracers.style.display = 'none';
        });

        // ******************** EVENEMENTS-BUTTON-MENU **********************

        tools.save.addEventListener('click', function () {
            var img = drawing.ctx.canvas.toDataURL("image/png");
            img = img.replace("image/png", "image/octet-stream");
            window.open(img);
        });
        tools.axev.addEventListener('click', function () {
            var axev = document.getElementById("vertical");
            if (axev !== null) {
                remover('vertical');
            } else {
                symetrie_tracer('vertical');
            }
        });
        tools.axeh.addEventListener('click', function () {
            var axeh = document.getElementById("horizontal");
            if (axeh !== null) {
                remover('horizontal');
            } else {
                symetrie_tracer('horizontal');
            }
        });
        tools.upload.addEventListener('change', function (e) {
            document.getElementById('add').click();
            var reader = new FileReader();
            reader.onload = function (event) {
                var img = new Image();
                img.onload = function () {
                    drawing.ctx.canvas.width = img.width;
                    drawing.ctx.canvas.height = img.height;
                    drawing.ctx.drawImage(img, 0, 0);
                };
                img.src = event.target.result;
            };
            if (e.target.files[0].type.match('image.*')) {
                reader.readAsDataURL(e.target.files[0]);
            }
        });

        tools.add.addEventListener('click', function () {
            var count = drawing.all.length;
            if (count > 0) {
                var next = parseInt(drawing.all[count - 1].canvas.id.substring(drawing.all[count - 1].canvas.id.length - 1, drawing.all[count - 1].canvas.id.length)) + 1;
                var left = drawing.ctx.canvas.style.left;
                var top = drawing.ctx.canvas.style.top;
                var h = drawing.ctx.canvas.height;
                var w = drawing.ctx.canvas.width;

                // if input height width; h w

                drawing.ctx.canvas.style.border = '1px solid black';
                drawing.ctx.canvas.style.left = left;
                drawing.ctx.canvas.style.top = top;
                drawing.ctx.canvas.style.border = '1px solid red';
                drawing.ctx = create_canvas('paint_' + next, h, w, drawing.ctx, drawing.all); // height width
            } else {
                drawing.ctx = create_canvas('paint_' + 0, 1000, 1000, drawing.ctx, drawing.all); // height width
            }
            tools.thinck.setAttribute('value', drawing.ctx.lineWidth);
            return drawing.ctx;
        });

        tools.compile.addEventListener('click', function () {
            var count = drawing.all.length;
            var last = drawing.all[drawing.all.length - 1];
            var previd = parseInt(last.canvas.id.substring(last.canvas.id.length - 1, last.canvas.id.length)) + 1;
            var i = 0;
            var can;
            var offsetLeft;
            var offsetTop;
            drawing.ctx = create_canvas('paint_' + previd, body.scrollHeight || 1000, body.scrollWidth || 1000, drawing.ctx, drawing.all);
            while (i < count) {
                can = document.getElementById(drawing.all[i].canvas.id);
                offsetLeft = parseInt(can.style.left);
                offsetTop = parseInt(can.style.top);
                drawing.ctx.drawImage(can, offsetLeft || 0, offsetTop || 0);
                i += 1;
            }
            return drawing.ctx;
        });


        tools.tracers.addEventListener('click', function (e) {
            var prewiew = e.target;
            var paint = prewiew.id.substring(1, prewiew.id.length);
            if (document.getElementById(paint)) {
                drawing.ctx = document.getElementById(paint).getContext('2d');
            }


        });
        tools.tracers.addEventListener('dblclick', function (e) {
            var prewiew = e.target;
            var paint = prewiew.id.substring(1, prewiew.id.length);
            var i = 0;
            remover(paint);
            remover(e.target.id);
            var count = drawing.all.length;
            while (i < count) {
                if (drawing.all[i] && drawing.all[i].canvas.id === paint) {
                    drawing.all.splice(i, 1);
                }
                i += 1;
            }
            if (drawing.all[drawing.all.length - 1]) {
                var next = drawing.all[drawing.all.length - 1].canvas.id;
                drawing.ctx = document.getElementById(next).getContext('2d');
            } else {
                document.getElementById('add').click();
            }
        });

        // ******************** DRAW **********************

        container.addEventListener('click', function (e) {
            var vertical = document.getElementById('vertical');
            var horizontal = document.getElementById('horizontal');
            if (tools.current === 'catch') {
                var canvas_selected = e.target;
                if (canvas_selected && canvas_selected !== drawing.ctx.canvas) {
                    drawing.ctx.canvas.style.borderColor = 'black';
                    canvas_selected.style.borderColor = 'red';
                    drawing.ctx = canvas_selected.getContext('2d');
                }
            }
            if (firstclick === false) {
                drawing.ctx.beginPath();
                mouse.x = e.pageX - drawing.ctx.canvas.offsetLeft;
                mouse.y = e.pageY - drawing.ctx.canvas.offsetTop;
                if (vertical) {
                    mouse.xshape = mouse.xmiddle + (mouse.xmiddle - e.pageX - drawing.ctx.canvas.offsetLeft);
                }
                if (horizontal) {
                    mouse.yshape = mouse.ymiddle + (mouse.ymiddle - e.pageY - drawing.ctx.canvas.offsetTop);
                }
                firstclick = true;
            } else {
                mouse.xto = e.pageX - drawing.ctx.canvas.offsetLeft;
                mouse.yto = e.pageY - drawing.ctx.canvas.offsetTop;
                mouse.xshapeto = mouse.xmiddle + (mouse.xmiddle - e.pageX - drawing.ctx.canvas.offsetLeft);
                mouse.yshapeto = mouse.ymiddle + (mouse.ymiddle - e.pageY - drawing.ctx.canvas.offsetTop);
                firstclick = false;
                var dx = mouse.xto - mouse.x;
                var dy = mouse.yto - mouse.y;
                var w = mouse.xshapeto - mouse.xshape;
                var h = mouse.yshapeto - mouse.yshape;
                var radiuscarre = dx * dx + dy * dy;

                switch (tools.current) {
                case 'circle':
                    axecircle(mouse.x, mouse.y, mouse.xshape, mouse.yshape, radiuscarre, false);
                    break;
                case 'circlefull':
                    axecircle(mouse.x, mouse.y, mouse.xshape, mouse.yshape, radiuscarre, true);
                    break;
                case 'rectangle':
                    axerectangle(mouse.x, mouse.y, mouse.xshape, mouse.yshape, dx, dy, w, h, false);
                    break;
                case 'rectanglefull':
                    axerectangle(mouse.x, mouse.y, mouse.xshape, mouse.yshape, dx, dy, w, h, true);

                    break;
                case 'line':
                    drawing.ctx.moveTo(mouse.x, mouse.y);
                    drawing.ctx.lineTo(mouse.xto, mouse.yto);
                    if (vertical) {
                        drawing.ctx.moveTo(mouse.xshape, mouse.y);
                        drawing.ctx.lineTo(mouse.xshapeto, mouse.yto);
                    }
                    if (horizontal) {
                        drawing.ctx.moveTo(mouse.x, mouse.yshape);
                        drawing.ctx.lineTo(mouse.xto, mouse.yshapeto);
                    }
                    if (horizontal && vertical) {
                        drawing.ctx.moveTo(mouse.xshape, mouse.yshape);
                        drawing.ctx.lineTo(mouse.xshapeto, mouse.yshapeto);
                    }
                    break;
                }
                drawing.ctx.stroke();
            }
            e.preventDefault();
        });

        var start = false;
        container.addEventListener('mousedown', function (e) {
            var x = e.pageX - drawing.ctx.canvas.offsetLeft;
            var y = e.pageY - drawing.ctx.canvas.offsetTop;
            var vertical = document.getElementById('vertical');
            var horizontal = document.getElementById('horizontal');
            var id;
            var xsym;
            var ysym;
            if (tools.current === 'erase') {
                drawing.ctx.globalCompositeOperation = "destination-out";
            } else {
                drawing.ctx.globalCompositeOperation = "source-over";
            }
            if (tools.current === 'pencil' || tools.current === 'erase') {
                draw(x, y, x, y, drawing.ctx);
                if (vertical) {
                    xsym = mouse.xmiddle + (mouse.xmiddle - e.pageX - drawing.ctx.canvas.offsetLeft);
                    id = horizontal
                        ? 'paint_' + (drawing.all.length - 4)
                        : 'paint_' + (drawing.all.length - 2);
                    drawing.ctxsym = clonectx(id);
                    draw(xsym, y, xsym, y, drawing.ctxsym);
                }
                if (horizontal) {
                    ysym = mouse.ymiddle + (mouse.ymiddle - e.pageY - drawing.ctx.canvas.offsetTop);
                    id = horizontal
                        ? 'paint_' + (drawing.all.length - 3)
                        : 'paint_' + (drawing.all.length - 2);
                    drawing.ctysym = clonectx(id);
                    draw(x, ysym, x, ysym, drawing.ctysym);
                }
                if (vertical && horizontal) {
                    id = 'paint_' + (drawing.all.length - 2);
                    drawing.ctxysym = clonectx(id);
                    draw(xsym, ysym, xsym, ysym, drawing.ctxysym);
                }
            }
            start = true;
            e.preventDefault();
        });
        container.addEventListener('mouseup', function (e) {
            start = false;
            e.preventDefault();
        });
        container.addEventListener('mousemove', function (e) {
            if (start) {
                var x = e.pageX - drawing.ctx.canvas.offsetLeft;
                var y = e.pageY - drawing.ctx.canvas.offsetTop;
                var vertical = document.getElementById('vertical');
                var horizontal = document.getElementById('horizontal');
                if (tools.current === 'pencil' || tools.current === 'erase') {
                    drawing.ctx.lineTo(x, y);
                    drawing.ctx.stroke();
                    if (vertical) {
                        var xsym = mouse.xmiddle + (mouse.xmiddle - e.clientX - drawing.ctx.canvas.offsetLeft);
                        drawing.ctxsym.lineTo(xsym, y);
                        drawing.ctxsym.stroke();
                    }
                    if (horizontal) {
                        var ysym = mouse.ymiddle + (mouse.ymiddle - e.clientY - drawing.ctx.canvas.offsetTop);
                        drawing.ctysym.lineTo(x, ysym);
                        drawing.ctysym.stroke();
                    }
                    if (vertical && horizontal) {
                        var xxsym = mouse.xmiddle + (mouse.xmiddle - e.clientX - drawing.ctx.canvas.offsetLeft);
                        var yysym = mouse.ymiddle + (mouse.ymiddle - e.clientY - drawing.ctx.canvas.offsetTop);
                        drawing.ctxysym.lineTo(xxsym, yysym);
                        drawing.ctxysym.stroke();
                    }
                }
                if (tools.current === 'catch') {
                    var xcenter = e.pageX - (drawing.ctx.canvas.width / 2);
                    var ycenter = e.pageY - (drawing.ctx.canvas.height / 2);
                    drawing.ctx.canvas.draggable = true;
                    drawing.ctx.canvas.style.left = xcenter + 'px';
                    drawing.ctx.canvas.style.top = ycenter + 'px';
                }
            }
        });
        container.addEventListener('mouseover', function (e) {
            drawing.ctx.canvas.style.cursor = 'crosshair';
            e.preventDefault();
        });
    });
};
myPaint();