$(function()
{
	function objToStr(obj)
	{
		let s = [];
		for(let i = 0; i < obj.length; i++)
		{
			if(obj[i].id.indexOf("(") !== -1)
				s.push(obj[i].id.split('(')[0]);
			else
				s.push(obj[i].id);
		}
		return s;
	}

	$('#svg-map').on('load', function(a) {
		const width = 500;
		const height = 732;
		const svgDoc = a.target.contentDocument;
		let $map = $(a.target.contentDocument);
		const Portugal = $map.find('.País');
		const Distritos = $map.find('.Distritos');
		const Exclaves = $map.find('.exclave');
		const Ilhas = $map.find('.ilha');
		const Exfregs = $map.find('.exfreg');
		const Locs = $map.find('.locs');
		const Pins = $map.find('.pins');
		let dists = [];
		let concs = [];
		let fregsall = [];
		let fregs = [];
		let exfregs = [];
		let locs = [];
		let pins = [];
		let dp = [];
		let dd = [];
		let dc = [];
		let df = [];
		let def = [];
		let dl = [];
		let dpins = [];
		let dpinsaux = [];
		let selPin = '';
		let container = document.getElementById('container');
		let tempBox = {
			H: 0,
			W: 0,
			X: 0,
			Y: 0
		}
		let loaded = [];
		for (let q = 0; q < Pins.length; q++)
			if (q % 2 === 0)
				dpins.push({
					Id: Pins[q].attributes[3].value,
					Pin: Pins[q].attributes[0].value
				}); //Pins
			else
				dpins.push({
					Id: Pins[q].attributes[3].value,
					Desc: Pins[q].attributes[4].value,
					Image: Pins[q].attributes[5].value,
					Pin: Pins[q].attributes[0].value,
					W: Pins[q].attributes[8].value,
					H: Pins[q].attributes[7].value
				}); //Images of pins
		for (let i = 0; i < Distritos.length; i++) {
			let strAux = Distritos[i].id.split('(')[0];
			strAux = strAux == "Bragança" ? "Braganca" : strAux;
			strAux = strAux == "Castelo Branco" ? "CB" : strAux;
			strAux = strAux == "Évora" ? "Evora" : strAux;
			strAux = strAux == "Santarém" ? "Santarem" : strAux;
			strAux = strAux == "Setúbal" ? "Setubal" : strAux;
			strAux = strAux == "Viana do Castelo" ? "VC" : strAux;
			strAux = strAux == "Vila Real" ? "VR" : strAux;
			let $tempDist = $map.find('.'+strAux);
			for (let j = 0; j < $tempDist.length; j++) {
				let $tempConc = $map.find('.'+$tempDist[j].id.replace(/ +/g, "").toLowerCase().split('(')[0] + "freg");
				for (let k = 0; k < $tempConc.length; k++) {
					if (!($tempConc[k].classList.contains('exclave') || $tempConc[k].classList.contains('ilha') 
					|| $tempConc[k].classList.contains('exfreg') || $tempConc[k].classList.contains('locs')))
						fregs.push({
							Name: $tempConc[k].id,
							Concelho: $tempDist[j],
							Distrito: Distritos[i],
							Freguesia: $tempConc[k]
						});
					else if ($tempConc[k].id in Exfregs)
					{
						exfregs.push({
							Name: $tempConc[k].id,
							Concelho: $tempDist[j],
							Distrito: Distritos[i],
							Freguesia: $tempConc[k]
						});
					}
					else if ($tempConc[k].id in Locs)
						locs.push({
							Name: $tempConc[k].id,
							Concelho: $tempDist[j],
							Distrito: Distritos[i],
							Localidade: $tempConc[k]
						});
					fregsall.push({
						Name: $tempConc[k].id,
						Concelho: $tempDist[j],
						Distrito: Distritos[i],
						Freguesia: $tempConc[k]
					});
				}
				concs.push({
					Name: $tempDist[j].id,
					Distrito: Distritos[i],
					Concelho: $tempDist[j],
					Freguesias: $tempConc,
				});
			}
			dists.push({
				Name: Distritos[i].id.split('(')[0],
				Distrito: Distritos[i],
				Concelhos: $map.find("." + strAux),
				Freguesias: $map.find(".freg" + strAux.toLowerCase())
			});
		};
		dp.push({
			Path: Portugal[0].attributes[0].value,
			Id: Portugal[0].id
		});
		for (let i = 0; i < Pins.length; i++)
			pins.push(Pins[i]);
		for (let i = 0; i < dists.length; i++)
			dd.push({
				Path: dists[i].Distrito.attributes[0].value,
				Id: Distritos[i].id
			});
		for (let i = 0; i < concs.length; i++)
		{
			dc.push({
				Path: concs[i].Concelho.attributes[0].value,
				Id: concs[i].Name
			});
		}
		for (let i = 0; i < fregsall.length; i++)
			df.push({
				Path: fregsall[i].Freguesia.attributes[0].value,
				Id: fregsall[i].Name
			});
		for (let i = 0; i < exfregs.length; i++)
			def.push({
				Path: exfregs[i].Freguesia.attributes[0].value,
				Id: exfregs[i].Name
			});
		for (let i = 0; i < locs.length; i++)
			dl.push({
				Path: locs[i].Localidade.attributes[0].value,
				Id: locs[i].Name
			});
		for (let cfregs = 0; cfregs < dists.length; cfregs++)
			console.log("Freguesias de " + dists[cfregs].Name.split('(')[0] + ": " + filterItems(dists[cfregs].Name.split('(')[0]).length);
		console.log("\nTotal de freguesias: " + parseInt(fregs.length));
		const span = document.getElementById("span");
		const btn = document.getElementById("reset");
		const play = document.getElementById("game");
		const goalText = document.getElementById("goalText");
		btn.style.display = "none";

		let x = Math.floor((Math.random() * fregsall.length) + 1);
		//let goal = Concelhos[x].id;
		let guess = "";
		let tries = Number.MAX_SAFE_INTEGER;
		let lose = false;
		let game = false;

		for (let i = 0; i < dists.length; i++)
			dists[i].Distrito.attributes[0].value = "";
		for (let i = 0; i < concs.length; i++)
			concs[i].Concelho.attributes[0].value = "";
		for (let i = 0; i < fregsall.length; i++)
			fregsall[i].Freguesia.attributes[0].value = "";
		for (let i = 0; i < fregs.length; i++)
			fregs[i].Freguesia.attributes[0].value = "";
		for (let i = 0; i < exfregs.length; i++)
			exfregs[i].Freguesia.attributes[0].value = "";
		for (let i = 0; i < locs.length; i++)
			locs[i].Localidade.attributes[0].value = "";

		function hidePins() {
			for (let i = 0; i < Pins.length; i++)
				if (i % 2 === 0)
					Pins[i].attributes[0].value = "";
				else {
					Pins[i].attributes[5].value = "";
					Pins[i].attributes[7].value = 0;
					Pins[i].attributes[8].value = 0;
				}
		}
		hidePins();

		function answer(a, b) {
			return (a === b);
		}

		function bigger(a, b) {
			return (a >= b ? a : b);
		}

		function smaller(a, b) {
			return (a < b ? a : b);
		}

		function filterItems(dist) {
			return fregs.filter(function(el) {
				return el.Distrito.id.split('(')[0].toLowerCase() === dist.toLowerCase();
			})
		}

		function filterExFregs(freg) {
			return exfregs.filter(function(el) {
				if (freg.includes('loc#'))
					return false;
				if (freg.includes('('))
					return freg.split('(')[1].toLowerCase().includes(el.Freguesia.id.split('(')[0].toLowerCase());
				return freg.toLowerCase().includes(el.Freguesia.id.split('(')[0].toLowerCase());
			})
		}

		function filterLocs(freg) {
			return locs.filter(function(el) {
				if (freg.id !== undefined)
					return freg.id.split(' ').join('_').toLowerCase() === el.Localidade.id.split('#')[1].split(')')[0].toLowerCase();
				else
					return freg.split(' ').join('_').toLowerCase() === el.Localidade.id.split('#')[1].split(')')[0].split(' ').join('_').toLowerCase();
			})
		}

		function filterPins(freg) {
			return pins.filter(function(el) {
				let sep = el.id.split(/[\s_][0-9]+/);
				return sep[0].toLowerCase() === freg.split(' ').join('_').toLowerCase();
			})
		}

		function cleanConcelhos() {
			cleanFreguesias();
			cleanExFreguesias();
			cleanLocalidades();
			for (let i = 0; i < dists.length; i++)
				for (let j = 0; j < dists[i].Concelhos.length; j++)
					dists[i].Concelhos[j].attributes[0].value = "";
		}

		function cleanFreguesias() {
			for (let i = 0; i < fregsall.length; i++)
				fregsall[i].Freguesia.attributes[0].value = "";
			hidePins();
		}

		function cleanExFreguesias() {
			for (let i = 0; i < exfregs.length; i++)
				exfregs[i].Freguesia.attributes[0].value = "";
		}

		function cleanLocalidades() {
			for (let i = 0; i < locs.length; i++)
				locs[i].Localidade.attributes[0].value = "";
		}

		btn.addEventListener("click", reset);

		function reset() {
			container.innerHTML = '';
			selPin = '';
			cleanConcelhos();
			btn.style.display = "none";
			span.innerHTML = "";
			//span.innerHTML = `Where is ${goal}?`;
			//if(game)
			svgDoc.children[0].setAttribute(`viewBox`, `0 0 ${width} ${height}`);
			/*else{
			tries = 3
			x = Math.floor((Math.random() * 278)+1);
			goal = Concelhos[x].id;
			svgDoc.children[0].setAttribute(`viewBox`, `0 0 ${width} ${height}`);
			span.innerHTML = `Where is ${goal}?`;
			//game = true;
			}*/
		}

		function func(arr, str) {
			return arr.find(p => p.Id.includes(str.replace(/ /g, '_')));
		}

		function orderPins(pins) {
			let auxPins = [];
			let auxPins2 = [];
			for (let i = 1; i < pins.length; i += 2) {
				auxPins.push(pins[i]);
			}
			auxPins.sort(function(a, b) {
				if (a.attributes[4].value.toLowerCase() < b.attributes[4].value.toLowerCase())
					return -1;
				if (a.attributes[4].value > b.attributes[4].value)
					return 1;
				return 0;
			});
			for (let i = 0; i < auxPins.length; i++) {
				auxPins2.push(pins[pins.indexOf(pins.find(p => p.id.includes(':Img') && p.attributes[4].value === auxPins[i].attributes[4].value)) - 1]);
				auxPins2.push(auxPins[i]);
			}
			return auxPins2;
		}

		auxPins = orderPins(pins);

		function showDists() {
			Portugal[0].attributes[0].value = "";
			for (let i = 0; i < dists.length; i++) {
				dists[i].Distrito.attributes[0].value = dd[i].Path;
				dists[i].Distrito.addEventListener("click", function(el) {
					container.innerHTML = '';
					btn.style.display = "inline-block";
					let x = el.clientX;
					let y = el.clientY;

					cleanConcelhos();
					let tgt = el.target.getBBox();
					let z = 360 / (tgt.width + tgt.height);
					svgDoc.children[0].setAttribute(`viewBox`, `${tgt.x-((width/z)/2)} ${tgt.y-((height/z)/2)} ${width/z} ${height/z}`);
					span.innerHTML = el.target.id;
					for (let j = 0; j < dists[i].Concelhos.length; j++) {
						dists[i].Concelhos[j].attributes[0].value = dc.find(x => x.Id === dists[i].Concelhos[j].id).Path;
						if (!loaded.includes(dists[i].Concelhos[j].id)) {
							loaded.push(dists[i].Concelhos[j].id);
							dists[i].Concelhos[j].addEventListener("click", el2 => {
								/*if(game){
								if(answer(el2.target.id, goal)){
								tries = 3
								game=false;
								span.innerHTML = `Win(${el2.target.id})!`;
								btn.style.visibility="visible";
								}
								else{
								tries--;
								span.innerHTML = `Wrong(${el2.target.id})! Lives = ${tries}.`;
								if(tries <= 0){
								game=false;
								span.innerHTML += `\nLose...`;
								}
								}
								}
								else */
								container.innerHTML = '';
								let click = false;
								let tgt2 = el2.target.getBBox();
								let z = 430 / (tgt2.width + tgt2.height);
								svgDoc.children[0].setAttribute(`viewBox`, `${tgt2.x-((width/z)/2)} ${tgt2.y-((height/z)/2)} ${width/z} ${height/z}`);
								span.innerHTML = el2.target.id;
								cleanFreguesias();
								cleanExFreguesias();
								let currConc = concs.find(x => x.Name === dists[i].Concelhos[j].id);
								for (k = 0; k < currConc.Freguesias.length; k++) {
									let currFreg = currConc.Freguesias[k];
									if (!(currFreg.id.includes('exfreg') || currFreg.id.includes('loc#')))
										currFreg.attributes[0].value = df.find(x => x.Id === currFreg.id).Path;
									if (loaded.find(lf => lf === currFreg.id) === undefined) {
										loaded.push(currFreg.id);
										currFreg.addEventListener("click", el3 => {
											if (!(el3.target.id.includes('exfreg') || el3.target.id.includes('#')))
												container.innerHTML = '';
											let fregPins = orderPins(filterPins(currFreg.id));
											if (fregPins.length > 0) {
												let select = document.createElement("select");
												var optionAux = document.createElement("option");
												optionAux.value = null;
												optionAux.text = "Escolha uma opção:";
												select.appendChild(optionAux);
												for (let i = 0; i < fregPins.length; i += 2) {
													var option = document.createElement("option");
													option.value = fregPins[i];
													option.text = fregPins[i + 1].attributes[4].value;
													select.appendChild(option);
												}
												select.addEventListener("change", op => {
													if (op.target.value !== "null") {
														let idx = pins.indexOf(pins.find(p => p.id.includes(':Img') && p.attributes[4].value === op.target.options.item(op.target.options.selectedIndex).text));
														let pinTemp = pins[idx - 1];
														selPin = pinTemp.id;
														for (let i = 0; i < fregPins.length; i += 2) {
															let tempPin2 = dpins.find(d => d.Id === fregPins[i].id);
															let tempPin3 = dpins.find(d => d.Id === fregPins[i + 1].id);
															fregPins[i].attributes[0].value = tempPin2.Pin;
															fregPins[i + 1].attributes[5].value = tempPin3.Image;
															fregPins[i + 1].attributes[7].value = tempPin3.H;
															fregPins[i + 1].attributes[8].value = tempPin3.W;
															if (fregPins[i].id.split(':')[0] !== pinTemp.id.split(':')[0]) {
																fregPins[i].attributes[0].value = '';
																fregPins[i + 1].attributes[5].value = '';
																fregPins[i + 1].attributes[7].value = 0;
																fregPins[i + 1].attributes[8].value = 0;
															}
														}
														let tempBBox = pins[idx].getBBox();
														let z = 200 / (tempBBox.width + tempBBox.height);
														svgDoc.children[0].setAttribute(`viewBox`, `${tempBBox.x-((width/z)/2)} ${tempBBox.y-((height/z)/2)} ${width/z} ${height/z}`);
													}
												});
												var label = document.createElement("label");
												label.innerHTML = "Destaques: "
												container.appendChild(label).appendChild(select);
											} else if (!(currFreg.id.includes('exfreg') || currFreg.id.includes('#')))
												hidePins();

											if (currFreg.id.includes('exfreg') || currFreg.id.includes('loc#')) {
												span.innerHTML = currFreg.id.split('(')[0];
												return;
											}
											let tgt3 = el3.target.getBBox();
											let z = 400 / (tgt3.width + tgt3.height);
											selPin = '';

											if (!(el3.target.id.includes('exfreg') || el3.target.id.includes('#'))) {
												cleanExFreguesias();
												cleanLocalidades();
											}

											span.innerHTML = el3.target.id;
											if (fregPins.length > 0) {
												if (!(el3.target.id.includes('exfreg') || el3.target.id.includes('loc#')))
													hidePins();
												if (!(el3.target.id.includes('loc#'))) {
													svgDoc.children[0].setAttribute(`viewBox`, `${tgt3.x-((width/z)/2)} ${tgt3.y-((height/z)/2)} ${width/z} ${height/z}`);
												}
												let l;
												for (l = 0; l < fregPins.length; l = l + 2) {
													click = true;
													fregPins[l].attributes[0].value = dpins.find(d => d.Id === fregPins[l].id).Pin;
													fregPins[l + 1].attributes[5].value = dpins.find(d => d.Id === fregPins[l + 1].attributes[3].value).Image;
													fregPins[l + 1].attributes[7].value = dpins.find(d => d.Id === fregPins[l + 1].attributes[3].value).H;
													fregPins[l + 1].attributes[8].value = dpins.find(d => d.Id === fregPins[l + 1].attributes[3].value).W;
												}
											}
											let filtEf = filterExFregs(el3.target.id);
											if (filtEf.length > 1) {
												let tgta = el3.target.getBBox();
												let z = 380 / (tgta.width + tgta.height);
												svgDoc.children[0].setAttribute(`viewBox`, `${tgta.x-((width/z)/2)} ${tgta.y-((height/z)/2)} ${width/z} ${height/z}`);
												for (let l = 0; l < filtEf.length; l++) {
													let ef = exfregs.find(x => x.Freguesia.id === filtEf[l].Name);
													ef.Freguesia.attributes[0].value = def.find(x => x.Id === filtEf[l].Name).Path;
												}
											}
											let fLocs = filterLocs(el3.target.id.split('(')[0]);
											if (fLocs.length > 0) {
												tempBox.H = tgt3.height;
												tempBox.W = tgt3.width;
												tempBox.X = tgt3.x;
												tempBox.Y = tgt3.y;
												let z = 380 / (tgt3.width + tgt3.height);
												svgDoc.children[0].setAttribute(`viewBox`, `${tgt3.x-((width/z)/2)} ${tgt3.y-((height/z)/2)} ${width/z} ${height/z}`);
												for (let i = 0; i < fLocs.length; i++) {
													let loc = locs.find(x => x.Localidade.id === fLocs[i].Name);
													loc.Localidade.attributes[0].value = dl.find(x => x.Id === fLocs[i].Name).Path;
												}
											}
											if (filtEf.length < 2 && fLocs < 1 && fregPins.length === 0 && !(currFreg.id.includes('exfreg') || currFreg.id.includes('loc#'))) {
												hidePins();
												z = 430 / (tgt2.width + tgt2.height);
												svgDoc.children[0].setAttribute(`viewBox`, `${tgt2.x-((width/z)/2)} ${tgt2.y-((height/z)/2)} ${width/z} ${height/z}`);
											}
										});

										let fregPins = orderPins(filterPins(currFreg.id));
										for (l = 0; l < fregPins.length; l = l + 2) {
											fregPins[l].addEventListener("mouseover", el5 => {
												let m;
												if (selPin === '')
													for (m = 0; m < fregPins.length; m++)
														if (fregPins[m].attributes[3].value.includes(currFreg.id.replace(/ /g, '_')) && !(fregPins[m].attributes[3].value.split(':')[0] === el5.target.attributes[3].value.split(':')[0])) {
															if (m % 2 === 0)
																fregPins[m].attributes[0].value = "";
															else {
																fregPins[m].attributes[5].value = "";
																fregPins[m].attributes[7].value = 0;
																fregPins[m].attributes[8].value = 0;
															}
														}
											});
											fregPins[l].addEventListener("mouseout", el5 => {
												let m;
												if (selPin === '')
													for (m = 0; m < fregPins.length; m++)
														if (fregPins[m].attributes[3].value.includes(currFreg.id.replace(/ /g, '_')) && !(fregPins[m].attributes[3].value.split(':')[0] === el5.target.attributes[3].value.split(':')[0])) {
															if (m % 2 === 0)
																fregPins[m].attributes[0].value = dpins.find(d => d.Id === fregPins[m].id).Pin;
															else {
																fregPins[m].attributes[5].value = dpins.find(d => d.Id === fregPins[m].attributes[3].value).Image;
																fregPins[m].attributes[7].value = dpins.find(d => d.Id === fregPins[m].attributes[3].value).H;
																fregPins[m].attributes[8].value = dpins.find(d => d.Id === fregPins[m].attributes[3].value).W;
															}
														}
											});
											fregPins[l].addEventListener("click", el5 => {
												let idx = fregPins.indexOf(fregPins.find(fp => fp.id === el5.target.attributes[3].value));
												let tgt5 = fregPins[idx + 1].getBBox();
												let z = 200 / (tgt5.width + tgt5.height);
												svgDoc.children[0].setAttribute(`viewBox`, `${tgt5.x-((width/z)/2)} ${tgt5.y-((height/z)/2)} ${width/z} ${height/z}`);
												span.innerHTML = fregPins[idx + 1].attributes[4].value;
												let option = Array.from(container.children[0].children[0].options).find(op => op.label === fregPins[idx + 1].attributes[4].value);
												container.children[0].children[0].selectedIndex = option.index;
												container.children[0].children[0].selectedOptions = option;
												if (el5.target.id.split(':')[0] === selPin.split(':')[0]) {
													selPin = '';
													let m;
													for (m = 0; m < fregPins.length; m++)
														if (fregPins[m].attributes[3].value.includes(currFreg.id.replace(/ /g, '_')) && !(fregPins[m].attributes[3].value.split(':')[0] === el5.target.attributes[3].value.split(':')[0])) {
															if (m % 2 === 0)
																fregPins[m].attributes[0].value = dpins.find(d => d.Id === fregPins[m].id).Pin;
															else {
																fregPins[m].attributes[5].value = dpins.find(d => d.Id === fregPins[m].attributes[3].value).Image;
																fregPins[m].attributes[7].value = dpins.find(d => d.Id === fregPins[m].attributes[3].value).H;
																fregPins[m].attributes[8].value = dpins.find(d => d.Id === fregPins[m].attributes[3].value).W;
															}
														}
												} else if (selPin === '') {
													selPin = el5.target.id;
													let m;
													for (m = 0; m < fregPins.length; m++)
														if (fregPins[m].attributes[3].value.includes(currFreg.id.replace(/ /g, '_')) && !(fregPins[m].attributes[3].value.split(':')[0] === el5.target.attributes[3].value.split(':')[0])) {
															if (m % 2 === 0)
																fregPins[m].attributes[0].value = "";
															else {
																fregPins[m].attributes[5].value = "";
																fregPins[m].attributes[7].value = 0;
																fregPins[m].attributes[8].value = 0;
															}
														}
												}

											});
											fregPins[l + 1].addEventListener("mouseover", el5 => {
												let m;
												if (selPin === '')
													for (m = 0; m < fregPins.length; m++)
														if (fregPins[m].attributes[3].value.includes(currFreg.id.replace(/ /g, '_')) && !(fregPins[m].attributes[3].value.split(':')[0] === el5.target.attributes[3].value.split(':')[0])) {
															if (m % 2 === 0)
																fregPins[m].attributes[0].value = "";
															else {
																fregPins[m].attributes[5].value = "";
																fregPins[m].attributes[7].value = 0;
																fregPins[m].attributes[8].value = 0;
															}
														}
											});
											fregPins[l + 1].addEventListener("mouseout", el5 => {
												let m;
												if (selPin === '')
													for (m = 0; m < fregPins.length; m++)
														if (fregPins[m].attributes[3].value.includes(currFreg.id.replace(/ /g, '_')) && !(fregPins[m].attributes[3].value.split(':')[0] === el5.target.attributes[3].value.split(':')[0]))
															if (m % 2 === 0)
																fregPins[m].attributes[0].value = dpins.find(d => d.Id === fregPins[m].id).Pin;
															else {
																fregPins[m].attributes[5].value = dpins.find(d => d.Id === fregPins[m].attributes[3].value).Image;
																fregPins[m].attributes[7].value = dpins.find(d => d.Id === fregPins[m].attributes[3].value).H;
																fregPins[m].attributes[8].value = dpins.find(d => d.Id === fregPins[m].attributes[3].value).W;
															}
											});
											fregPins[l + 1].addEventListener("click", el5 => {
												let tgt5 = el5.target.getBBox();
												let z = 200 / (tgt5.width + tgt5.height);

												svgDoc.children[0].setAttribute(`viewBox`, `${tgt5.x-((width/z)/2)} ${tgt5.y-((height/z)/2)} ${width/z} ${height/z}`);
												span.innerHTML = el5.target.attributes[4].value;
												let option = Array.from(container.children[0].children[0].options).find(op => op.label === el5.target.attributes[4].value);
												container.children[0].children[0].selectedIndex = option.index;
												container.children[0].children[0].selectedOptions = option;
												if (el5.target.id.split(':')[0] === selPin.split(':')[0]) {
													selPin = '';
													let m;
													for (m = 0; m < fregPins.length; m++)
														if (fregPins[m].attributes[3].value.includes(currFreg.id.replace(/ /g, '_')) && !(fregPins[m].attributes[3].value.split(':')[0] === el5.target.attributes[3].value.split(':')[0])) {
															if (m % 2 === 0)
																fregPins[m].attributes[0].value = dpins.find(d => d.Id === fregPins[m].id).Pin;
															else {
																fregPins[m].attributes[5].value = dpins.find(d => d.Id === fregPins[m].attributes[3].value).Image;
																fregPins[m].attributes[7].value = dpins.find(d => d.Id === fregPins[m].attributes[3].value).H;
																fregPins[m].attributes[8].value = dpins.find(d => d.Id === fregPins[m].attributes[3].value).W;
															}
														}
												} else if (selPin === '') {
													selPin = el5.target.id;
													let m;
													for (m = 0; m < fregPins.length; m++)
														if (fregPins[m].attributes[3].value.includes(currFreg.id.replace(/ /g, '_')) && !(fregPins[m].attributes[3].value.split(':')[0] === el5.target.attributes[3].value.split(':')[0])) {
															if (m % 2 === 0)
																fregPins[m].attributes[0].value = "";
															else {
																fregPins[m].attributes[5].value = "";
																fregPins[m].attributes[7].value = 0;
																fregPins[m].attributes[8].value = 0;
															}
														}
												}
											});

										}
										let filtEf = filterExFregs(currFreg.id);
										let tgta = currFreg.getBBox();
										let zef = 380 / (tgta.width + tgta.height);
										for (let l = 0; l < filtEf.length; l++) {
											let ef = exfregs.find(x => x.Freguesia.id === filtEf[l].Name);
											loaded.push(ef.Name);
											ef.Freguesia.addEventListener("click", el4 => {
												span.innerHTML = el4.target.id.split('(')[0];
												svgDoc.children[0].setAttribute(`viewBox`, `${tgta.x-((width/zef)/2)} ${tgta.y-((height/zef)/2)} ${width/zef} ${height/zef}`);
											});
										}
										let fLocs = filterLocs(currFreg);
										let tgtb = currFreg.getBBox();
										let zl = 380 / (tgtb.width + tgtb.height);
										for (let i = 0; i < fLocs.length; i++) {
											let loc = locs.find(x => x.Localidade.id === fLocs[i].Name);
											loc.Localidade.addEventListener("click", el5 => {
												span.innerHTML = fLocs[i].Name.split('(')[0];
												svgDoc.children[0].setAttribute(`viewBox`, `${tgtb.x-((width/zl)/2)} ${tgtb.y-((height/zl)/2)} ${width/zl} ${height/zl}`);
											});
										}
									}
								}
							});
						}
					}
				});
			}
		}

		play.addEventListener("click", () => {
			play.style.display = "none";
			console.log(locs);
			/*x = Math.floor((Math.random() * fregsall.length)+1);
			goal = fregsall[x].Name;
			span.innerHTML = `Where is ${goal}?`;
			guess = "";
			tries = 3;
			game = false;
			lose = false;*/
			showDists();
		});
	});
});