/*
 * Validator Class
 * Copyright (c) 2016 Alvin So
 * Version: 1.04 (26-May-2026)
 */
function Validator(jQuery) {
	var valid_status = true;
	var error_key = null;
	var $ = jQuery;
		
	this.getValStatus = function(){
		return valid_status;
	}
	
	this.getErrorKey = function(){
		return error_key;
	}
	
	this.multiVal = function(input, case_arr, option){
		if(is_array(case_arr) && case_arr){
			UpdateErrorKey(null);
			for(var key in case_arr){
				if(!this.val(input, case_arr[key], option)){
					UpdateErrorKey(key);
					return false;
				}
			}
			return true;
		}else{
			if (typeof option == "undefined") {
				option = true;
			}
			if(option){
				UpdateValidStatus(false);
			}
			return false;	
		}
	}
	
	this.val = function(itemvalue, descriptor, option){
		if(is_array(descriptor)){
			return this.multiVal(itemvalue, descriptor, option);
		}
		if (typeof option == "undefined" || option == '') {
			option = true;
		}
		var pos = descriptor.indexOf('=');	
		var command, cmdvalue;
		if(pos !== -1){
			command = descriptor.substring(0, pos);
			cmdvalue = descriptor.substring(pos + 1);
		}else{
			command = descriptor;
		}
		var ret = true;
		switch(command){
		   case "req": 
		   case "required": 
			  { 
				ret = RequiredInput(itemvalue);
				break;             
			  }
		   case "maxlen": 
		   case "maxlength": 
			  { 
				 ret = MaxLen(itemvalue,cmdvalue);
				 break; 
			  } 
		   case "minlen": 
		   case "minlength": 
			  { 
				 ret = MinLen(itemvalue,cmdvalue);
				 break; 
			  }
		   case "alnum": 
		   case "alphanumeric": 
			  { 
				 ret = InputType(itemvalue,/^(\w+)?$/g);
				 break; 
			  }
		   case "alnum_s": 
		   case "alphanumeric_space": 
			  {
				 ret = InputType(itemvalue,/^(\w+(\s?\w+)*)?$/g);
				 break; 
			  }		   
		   case "num": 
		   case "numeric": 
			  { 
				 ret = InputType(itemvalue,/^(\-?\d+)?$/g);
				 break;               
			  }
		   case "numdec":
		   case "numericdecimal": 
			  { 
				 ret = InputType(itemvalue,/^(\-?\d+(\.\d+)?)?$/g);
				 break;               
			  }
		   case "dec": 
		   case "decimal": 
			  { 
				 ret = Decimal(itemvalue,cmdvalue);
				 break;               
			  }
		   case "int": 
		   case "integer": 
			  { 
				 ret = InputType(itemvalue,/^(\d+)?$/g);
				 break;               
			  }
		   case "alpha": 
		   case "alphabetic": 
			  { 
				 ret = InputType(itemvalue,/^([A-Za-z]+)?$/g);
				 break; 
			  }
		   case "alpha_s": 
		   case "alphabetic_space": 
			  {
				 ret = InputType(itemvalue,/^([A-Za-z]+(\s?[A-Za-z]+)*)?$/g);
				 break; 
			  }
		   case "email": 
			  { 
				 ret = InputType(itemvalue,/^([a-zA-Z0-9\._\-]+@[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,})?$/g);
				 break; 
			  }
		   case "lt": 
		   case "lessthan": 
			  { 
				 ret = LessThan(itemvalue,cmdvalue);
				 break; 
			  }
		   case "gt": 
		   case "greaterthan": 
			  { 
				 ret = GreaterThan(itemvalue,cmdvalue);
				 break; 
			  } 
		   case "let":
		   case "lessorequalthan": 
			  { 
				 ret = LessOrEqualThan(itemvalue,cmdvalue);
				 break; 
			  }
		   case "get":
		   case "greaterorequalthan": 
			  { 
				 ret = GreaterOrEqualThan(itemvalue,cmdvalue);
				 break; 
			  }
		   case "dontselect": 
			  { 
				 ret = DontSelect(itemvalue,cmdvalue);
				 break; 
			  }
		   case "shouldselect":
			  {
				 ret = ShouldSelect(itemvalue,cmdvalue);
				 break;
			  }		 
		   case "dontselectchk":
			  {
				 ret = DontSelectChk(itemvalue,cmdvalue);
				 break;
			  }
		   case "shouldselchk":
			  {
				 ret = ShouldSelectChk(itemvalue,cmdvalue);
				 break;
			  }
		   case "selone_radio":
			  {
				 ret = SelectOneRadio(itemvalue);
				 break;
			  }
		   case "selone_chk":
			  {
				 ret = SelectOneChk(itemvalue);
				 break;
			  }
		   case "equal":
			  {
				 ret = Equal(itemvalue,cmdvalue);
				 break;
			  }
		   case "notequal":
			  {
				 ret = NotEqual(itemvalue,cmdvalue);
				 break;
			  }
		   case "advancedontselect": 
			  { 
				 ret = AdvanceDontSelect(itemvalue,cmdvalue);
				 break; 
			  }		
		   case "remote":
		      {
				 ret = remote(itemvalue,cmdvalue);
				 break;
			  }
		   case "customize": 
			  { 
				 var strRegExp = new RegExp(cmdvalue, 'g');
				 ret = InputType(itemvalue,strRegExp);
				 break; 
			  }		   
		}
		if(option){
			UpdateValidStatus(ret);
		}
		return ret;	
	}	
	
	this.setValStatus = function(status){
		valid_status = status;
	}
	
	function UpdateValidStatus(status){
		if(valid_status && !status){
			valid_status = status;
		}
	}
	
	function UpdateErrorKey(key){
		error_key = key;
	}
	
	function is_array(input){
		return typeof(input)=='object'&&(input instanceof Array);
	}
	
	function trim(input) { 
		return input.replace(/(^\s*)|(\s*$)$/g, ""); 
	} 

	function DontSelectChk(itemvalue,chkValue){
		if(IsCheckSelected(itemvalue,chkValue)){
			var ret = false;
		}else{
			var ret = true;
		}
		return ret;
	}
	function ShouldSelectChk(itemvalue,chkValue){
		return IsCheckSelected(itemvalue,chkValue);
	}
	function RequiredInput(itemvalue){
		var ret = true;
		itemvalue = trim(itemvalue);
		value = itemvalue.replace(/^\s+|\s+$/g, ""); 
		if(value.length == 0){
		   ret = false;
		}
		return ret;
	}
	function MaxLen(itemvalue,strMaxLen){
		var ret = true;
		if(itemvalue.length > strMaxLen){
		  ret = false; 
		}
		return ret;
	}
	function MinLen(itemvalue,strMinLen){
		var ret = true;
		if(itemvalue.length < strMinLen){
		  ret = false;
		}
		return ret;
	}
	function InputType(itemvalue,strRegExp){
		return strRegExp.test(itemvalue);
	}
	function Decimal(itemvalue,point){
		var point_array = point.split(",");
		var front = point_array[0];
		var behind = point_array[1];
		strRegExp = new RegExp('^\\d{1,' + front + '}(\\.\\d{1,' + behind + '})?$', 'g');
		return strRegExp.test(itemvalue);
	}
	function LessThan(itemvalue,strLessThan){
		var ret = true;
		if(itemvalue == null){  
			ret = false; 
		}else if(parseFloat(itemvalue) >= parseFloat(strLessThan)){ 
			ret = false;                 
		}   
		return ret;          
	}
	function GreaterThan(itemvalue,strGreaterThan){
		var ret = true;
		if(itemvalue == null){ 
		   ret = false; 
		}else if(parseFloat(itemvalue) <= parseFloat(strGreaterThan)){ 
		   ret = false;
		}
		return ret;           
	}
	function LessOrEqualThan(itemvalue,strLessThan){
		var ret = true;
		if(itemvalue == null){  
			ret = false; 
		}else if(parseFloat(itemvalue) > parseFloat(strLessThan)){ 
			ret = false;                 
		}   
		return ret;          
	}
	function GreaterOrEqualThan(itemvalue,strGreaterThan){
		var ret = true;
		if(itemvalue == null){ 
			ret = false; 
		}else if(parseFloat(itemvalue) <  parseFloat(strGreaterThan)){ 
			ret = false;
		}
		return ret;           
	}
	function DontSelect(itemvalue,dont_sel_index){
		var ret = true;
		if(itemvalue == null){ 
			ret = false;
		}
		if(itemvalue == dont_sel_index) {
			ret = false;
		}
		return ret;
	}
	function ShouldSelect(itemvalue,should_sel_index){
		var ret = true;
		if(itemvalue == null){
			ret = false; 
		}
		if(itemvalue != should_sel_index){
			ret = false;    
		}
		return ret;
	}
	function SelectOneRadio(itemvalue){
		var one_selected = false;
		for(var r = 0;r < itemvalue.length;r++){
			if(itemvalue[r].checked){
				one_selected = true;
				break;
			}
		}
		return one_selected;
	}
	function SelectOneChk(itemvalue){
		var one_selected = false;
		for(var r = 0;r < itemvalue.length;r++){
			if(itemvalue[r].checked){
				one_selected = true;
				break;
			}
		}
		return one_selected;
	}
	function Equal(itemvalue,objName){
		return itemvalue == objName; 
	}
	function NotEqual(itemvalue,objName){
		return itemvalue != objName; 
	}
	function AdvanceDontSelect(itemvalue,dont_sel_index){
		var ret = true;
		dont_array = dont_sel_index.split(",");
		var item = dont_array[0];
		var item2 = dont_array[1];
		var item2value = dont_array[2];
		if(itemvalue == null){ 
			ret = false;
		}
		if(itemvalue == item){ 
			if(item2 == item2value){
				ret = false;   
			}
		}
		return ret;
	}
	function IsCheckSelected(itemvalue,chkValue){
		var selected = false;
		if(itemvalue.length){
			for(var key in itemvalue){
				if(itemvalue[key] == chkValue){
					selected=true;
					break;
				}
			}
		}
		return selected;
	}
	function remote(itemvalue,condition){
		var ret = false;
		if(typeof $ != "undefined"){
			var condition_array = condition.split(",");
			var url = condition_array[0];
			var type = condition_array[1];
			condition_array.splice(0,2);
			var data = arrayToObject(condition_array);
			data['input'] = itemvalue;
			$.ajax({
				url: url,
				type: type ? type : 'post',
				data: data,
				datatype: 'json',
				async: false,
				global: false,
				success: function(response){
					if(response === "true"){
						ret = true;
					}else{
						ret = false;
					}
				}
			});
		}
		return ret;
	}
	function arrayToObject(arr){
		var object = {};
		for(var i = 0; i < arr.length; i++){
			var tmp = arr[i].split("=")
			object[tmp[0]] = (tmp[1] ? tmp[1] : '');
		}
		return object;
	}
}