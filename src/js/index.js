import 'jquery';
import 'cpr_pathpackage'; 
import 'lottie-web';

import {panels} from './views/panels';

import * as css from './views/cssView';
import ColorScheme from './views/colorScheme';
import TipsScheme from './views/tipsView';

import {state} from './state';

import variables from './../sass/abstracts/variables.scss';

import loadLoop from './lottie/loading-loop.json';
import cloudMain from './lottie/medium-cloud-texture.json';
import cloud0 from './lottie/small-cloud-green.json';
import cloud1 from './lottie/small-cloud-blue.json';
import cloud2 from './lottie/small-cloud-orange.json';
import cloud3 from './lottie/small-cloud-gray.json';
import { ok } from 'assert';

const question_length = panels.length-2;
const timing = variables.timing1;
state.qLen = question_length;
state.white = variables.white1;

const colorSchemeGroup = new ColorScheme(
	{'colorSchemes':[{
		'dialBgColor': variables.green2,
		'btnColorClass': '--0',	
		'background': 'background--0',		
	},
	{				
		'dialBgColor':variables.blue2,
		'btnColorClass':'--1',			
		'background': 'background--1',		
	},
	{				
		'dialBgColor':variables.tan1,
		'btnColorClass':'--2',		
		'background': 'background--2',		
	},
	{				
		'dialBgColor':variables.grey2,
		'btnColorClass':'--3',		
		'background': 'background--3',		
	},		
	{
		'dialBgColor': variables.green2,
		'btnColorClass': '--0',	
		'background': 'background--0',		
	},
	],
	'pageBreaks':[0,10,20,33,41],			
	}
);
const tipsSchemeGroup = new TipsScheme({
	'divActivate': '.panel--activate',
	'schemeObj': {
		'.landing__container': 'Tap on the circle in the center of your screen to advance to Question 1. Get help answering a question or navigating this tool by coming here anytime. You can always go back a question by clicking the arrow at the bottom of your screen.',
		'.slider__container': 'Use your cursor to drag the slider to the correct position.',
		'.likert__container': 'Click a circle to select the correct response.',
		'.vertfc__container': 'Click a circle to select the correct response.',
		'.dial-group': 'Use your cursor to drag the dial arm to the correct response.',
		'.checkbox__container': "Click on as many circles as you like, then choose 'Next' to proceed.",
	} 
});

state.colorScheme = colorSchemeGroup;
state.tipsScheme = tipsSchemeGroup;


$(document).ready(function(){

	/*** PRELOAD CTRL ***/
		setTimeout(function(){
			$('.preload').addClass('fade');	
		}, 3000);
			setTimeout(function(){
			$('.preload').addClass('hide');	
		}, 4000);

		setTimeout(function(){
			$('.pathfinder').addClass('fade-in');	
			$('.header__container').addClass('fade-in');	
			$('.gate__container').addClass('fade-in');
		}, 4000);


	/*** App path Ctrl ***/ 		
		$('.pathfinder').build({
			'panels': panels,
			'timing': timing,
			'spacing': 400,
			'state': state,
			// 'delay': 1,
		});

	/*** LOTTIE CTRL ***/

		//preloader
		lottie.loadAnimation({
		  container: document.getElementById('preload__container'),
		  renderer: 'svg',
		  autoplay: true,
		  animationData: loadLoop,
		  loop: true,
		});

		const preimages=["../assets/images/desktop/group.png","../assets/images/1x/bg-0.pn"];

		css.preloadImgs(preimages);

	/*** Dial Ctrl ***/
		$(".dial-tracker").cprDial({
			'thickness': .12,
			'height': '200%',
			'bgColor': variables.green2,
			'fgColor': state.white,
			'state': state,
			'percShow': false,		
		});

		$(".dial-tracker2").cprDial({
			'thickness': .12,
			'height': '200%',
			'bgColor': variables.green2,
			'fgColor': state.white,
			'state': state,		
			'percShow': true,
		});		


	// /*** Likert Ctrl ***/ 

		$('.likert__form').cprLikert({
			'vertical': false,
			'state': state,
		});

	// /*** Checkbox Ctrl ***/ 

		$('.checkbox__form').cprCheckbox({
			'vertical': false,
			'state': state,
			'size': .15,
		});

	// /*** Vertfc Ctrl ***/ 

		$('.vertfc__form').cprVertfc({
			'state': state,
			'size': .10,
		});

	/*** Slider Ctrl ***/ 
		
		$('.slider__form').cprSlider({
			'state': state,
			'size': .1,
			'sideIcons': false,
			'windowWidth': $('.panel').width(),
			'windowHeight': $('.panel').height(),
			'showOutput': true,
			'outputPerc': true,  
		});

	/*** Custom CSS on Btn Progress ***/

	window.statete = state;

	css.toggleHeader();

	$('.gate__form').submit(function(e){
		e.preventDefault();
		console.log('asdfasdf');
		state.company = $('#gate__company').val();
		state.revenue = $('#gate__revenue').val();
		state.country = $('#gate__country').val();
		state.employees = $('#gate__employees').val();
		state.industry = $('#gate__industry').val();


		$('.gate__form').removeClass('fade-in');
		setTimeout(function(){
			$('.gate__container').removeClass('fade-in');
		}, 1000);		
	});

	$('.btn__progress--40').click(postState);
	async function postState() {
		$('.footer').hide();
		const options = {
			method: 'POST',
			body: JSON.stringify(window.statete),
			headers: {
				'Content-Type': 'application/json',
			},
		}
		fetch('/api', options)
		.then((resp) => {
			return resp.json();
		})
		.then(resp =>{
			console.log(resp);
			return fetch('/api2', { method: 'GET'} )
		})
		.then((response) => {
			return response.json();	
		})
		.then( (el) => {
			const myJson = el;	
			// const userId = myJson.data[0].user_id;
			// console.log(`userID: ${userId}`);
			// $('.btn__pdf--1').attr('href',`http://oracle.assessment-tools.com/cx/maturity/pdf/${userId}`);
			css.loadLottie({
				'cloud--1-0': cloudMain,
				'cloud--2-0': cloud0,
				'cloud--2-1': cloud1,
				'cloud--2-2': cloud2,
				'cloud--2-3': cloud3,
			}, myJson, timing);
		})
	}


});

// ------------------------------------------------
// POST AND GET REQUEST TO GENERATE DATABASE
// ------------------------------------------------

	// $('.btn__progress--40').click(postState);
	// async function postState() {

	// 	const options = {
	// 		method: 'POST',
	// 		body: JSON.stringify(window.statete),
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 		},
	// 	}
	// 	fetch('/api', options)
	// 	.then((resp) => {
	// 		return resp.json();
	// 	})
	// 	.then(resp =>{
	// 		console.log(resp);
	// 		return fetch('/api2', { method: 'GET'} )
	// 	})
	// 	.then((response) => {
	// 		return response.json();	
	// 	})
	// 	.then( (el) => {
	// 		const myJson = el;

	// 		css.loadLottie({
	// 			'cloud--1-0': cloudMain,
	// 			'cloud--2-0': cloud0,
	// 			'cloud--2-1': cloud1,
	// 			'cloud--2-2': cloud2,
	// 			'cloud--2-3': cloud3,
	// 		}, myJson, timing);
	// 	})
	// }

// $('.btn__progress--40').on('click', function(){
// async function postState() {

// 	const options = {
// 		method: 'POST',
// 		body: JSON.stringify(window.statete),
// 		headers: {
// 			'Content-Type': 'application/json',
// 		},
// 	}
// 	fetch('/api', options)
// 	.then((resp) => {
// 		return resp.json();
// 	})
// 	.then(resp =>{
// 		console.log(resp);
// 		return fetch('/api2', { method: 'GET'} )
// 	})
// 	.then((response) => {
// 		return response.json();	
// 	})
// 	.then( (el) => {
// 		const myJson = el;

// 		css.loadLottie({
// 			'cloud--1-0': cloudMain,
// 			'cloud--2-0': cloud0,
// 			'cloud--2-1': cloud1,
// 			'cloud--2-2': cloud2,
// 			'cloud--2-3': cloud3,
// 		}, myJson, timing);
// 	})
// })



// ------------------------------------------------
// GET PDF DATA FUNCTION
// ------------------------------------------------

$('.header__rectangle--grow-2').click(getPdfData);
async function getPdfData() {
	fetch('/pdfdata')
	.then(response => {
		return response.json()
	})
	.then(el => {
		const pdfData = el;
		console.log(pdfData)
	})
}

// function loadLottie(obj, data){

// 	console.log(data);

// 	for(const key in obj){
// 		const lottieTemp = lottie.loadAnimation({
// 		  container: document.getElementById(key),
// 		  renderer: 'svg',
// 		  autoplay: false,
// 		  animationData: obj[key],
// 		  loop: false,
// 		});

// 		setTimeout(function(){
// 			lottieTemp.play(); 
// 		}, timing*2)
// 	}
// }