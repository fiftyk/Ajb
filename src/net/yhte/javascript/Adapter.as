package net.yhte.javascript
{
    import flash.display.Sprite;
    import flash.events.MouseEvent;
    import flash.external.ExternalInterface;
    import flash.system.Capabilities;
    import flash.system.IME;
    import flash.utils.describeType;
    import flash.utils.getDefinitionByName;
    import flash.utils.getQualifiedClassName;
    
    import mx.core.FlexGlobals;
    
    public class Adapter
    {
        private static const AS_OBJ:String = "AS_INSATNCE_";//actionscript序列化前缀
        private static const JS_FUNCS:String = "Ao._h";//Javascript函数序列化前缀
        private static const SCRIPT:String = 'Ao=function(d){this.uid=d;var a=d.match(/AS_INSATNCE_(.+)::(.+)_/);var b=this.methods();if(a){this.klass=a[2];this.fullklass=a[1]+"."+a[2]}for(var c=0;c<b.length;c++){var e=b[c];this[e]=function(){var g=[];for(var f=0;f<arguments.length;f++){g.push(Ao._e(arguments[f],this))}var h=Ao._f.S(this.uid,arguments.callee.N,g);if(h!=null){return Ao._d(h)}else{return this}};this[e]["N"]=e}};Ao.VERSION="1.4";Ao.init=function(a){Ao._f=a;if(!Ao._f.R||!Ao._f.$||!Ao._f.G||!Ao._f.S){alert("初始化失败!")}};Ao.$=function(a,b){return new Ao(Ao._f.$(a,Ao._e(b)))};Ao.prototype.methods=function(){return Ao._f.R("method",this.uid)};Ao.prototype.properties=function(){return Ao._f.R("accessor",this.uid)};Ao.prototype.toString=function(){return"<"+this.klass+":"+this.uid+">"};Ao._h={};Ao._i=function(){var a=arguments.callee;if(!a.hasOwnProperty("n")){a.n=0}else{a.n++}return"function_"+a.n};Ao.prototype.attr=function(d){if(typeof d=="object"){Ao._f.S(this.uid,Ao._e(d));return this}else{if(typeof d==="string"&&arguments.length===1){d=d.split(".");var a=Ao._f.G(this.uid,d);return Ao._d(a)}else{if(typeof d==="string"&&arguments.length>1){var c,b={};if(typeof arguments[1]==="function"){c=arguments[1].call(this)}else{c=arguments[1]}b[d]=c;return arguments.callee.call(this,b)}else{return this}}}};Ao._e=function(f,d){if(f==undefined||f==null){return f}else{if(f instanceof Ao){return f.uid}else{if(typeof f==="object"&&f.hasOwnProperty("length")){var c=[];for(var b=0;b<f.length;b++){c.push(arguments.callee.call(null,f[b]))}return c}else{if(typeof f==="function"){var e=Ao._i();for(var a in Ao._h){if(Ao._h[a].s==f){return"Ao._h."+a}}Ao._h[e]=function(g){return f.apply(d,Ao._d(g))};Ao._h[e].s=f;return"Ao._h."+e}else{if(typeof f==="object"){var c={};for(a in f){c[a]=arguments.callee.call(null,f[a])}return c}else{return f}}}}}};Ao._d=function(d){if(d==undefined||d==null){return d}else{if(typeof d==="string"&&d.indexOf("AS_INSATNCE_")===0){return new Ao(d)}else{if(typeof d==="object"&&d.hasOwnProperty("length")){var c=[];for(var b=0;b<d.length;b++){c.push(arguments.callee.call(null,d[b]))}return c}else{if(typeof d==="object"){var c={};for(var a in d){c[a]=arguments.callee.call(null,d[a])}return c}else{return d}}}}};Ao.isArray=function(a){return Object.prototype.toString.apply(a)==="[object Array]"};Ao.attr=function(f,b,g){if(typeof f==="object"&&typeof b==="string"){var b=b.split(".");var a=null;var e=f;for(var c=0;c<b.length;c++){if(e.hasOwnProperty(b[c])){a=e[b[c]];e=a}else{return g||null}}return a}else{return g||null}};AsObject=Ao;Array.prototype.indexOf=function(c){var a=this.length;for(var b=0;b<a;b++){if(c==this[b]){return b}}return -1};Array.prototype.query=function(g,o,C,u,t,v){var q=this.length,B=[],z=[],y=[],w=[],p,n,A="function";if(typeof g===A){for(var s=0;s<q;s++){if(g.call(this,this[s],u)){B.push(this[s])}else{z.push(this[s])}}}p=B.length;if(typeof o===A){for(var r=0;r<p;r++){y.push(o.call(this,B[r],t))}}n=z.length;if(typeof o===A){for(var h=0;h<n;h++){w.push(C.call(this,z[h],v))}}return[B,z,y,w]};Ao.prototype.is=function(c){var b=Ao._f.R("extendsClass",this.uid,"@type");var d=-1;for(var e=0;e<b.length;e++){var a=b[e];d=a.indexOf(c);if(d){break}}return d==-1?false:true};';
        private static var instance:Adapter = null;
        
        private var _seq:int = 0;
        private var _as_cache:Object = {};//复杂Actionscript对象存储
        private var _js_cache:Object = {};//复杂Javascript函数存储
        
        private function encode(value:*):*
        {
            var result:*;
            if (value is Number || value is Boolean || value is String ||
				value == null || value == undefined  ||
				value is int || value is uint)
			{
				result = value;
			}
			else if(getQualifiedClassName(value) == "Object")
            {
                result = {};
				for(var key:String in value)
				{
					result[key] = encode(value[key]);
				}
            }
            else if (value is Array)
            {
                result = [];
                var len:int = value.length;
                for(var i:int = 0; i < len; i++)
                {
                    result[i] = encode(value[i]);
                }
            }
            else
            {
                result = regist(value);
            }
            return result;
        };
        
        private function decode(value:*):*
        {
            var result:*;
            if(value is String && value.indexOf(AS_OBJ) == 0)
            {
                var asobj:* = _as_cache[value];
                if(!asobj)
                {
                    result = value;
                }
                else
                {
                    result = asobj;
                }
            }
            else if(value is String && value.indexOf(JS_FUNCS) == 0)
            {
                var func:Function = _js_cache[value];
                if(func == null)
                {
                    _js_cache[value] = function(...arg:*):*
                    {
                        arg = encode(arg);
                        return callJS(value,arg);
                    };
                }
                result = _js_cache[value];
            }
            else if(value is String && _as_cache[value])
            {
                result = _as_cache[value];
            }
            else if (value is Number || value is Boolean || value is String || value === null || value === undefined  || value is int || value is uint)
            {
                result = value;
            }
            else if(value is Array)
            {
                result = [];
                var len:int = value.length;
                for (var i:int = 0; i < len; i++)
                {
                    result[i] = decode(value[i]);
                }
            }
            else if(getQualifiedClassName(value) == "Object")
            {
                result = {};
                for(var key:String in value)
                {
                    result[key] = decode(value[key]);
                }
            }
            
            return result;
        };
        /**
         * @private
         */ 
        public function Adapter(sprite:Sprite)
        {
            if ( instance != null)
            {
                throw new Error("Singleton Class,please use Adapter.getInstance()");
            }
            //声明Ao对象
            ExternalInterface.call("eval",SCRIPT);
            //封装常用对象
            initialKlasses();
            for each(var mtd:String in ["R","$","G","S"])
            {            
                ExternalInterface.addCallback(mtd,this[mtd]);
            }
            
            sprite.addEventListener(MouseEvent.ROLL_OUT,
                onAppRollOut);
            
            var appId:String = AS_OBJ + new Date().getTime();
            regist(sprite,appId);
            /*
            通过flashvar参数传递标识，不够灵活
            */
            var uid:String = FlexGlobals.topLevelApplication.parameters.uid;
            callJS("Flash."+ uid,appId);
        }
        /**
         * 获得Adapter类的实例，只能通过此方法获得Adapter类的实例
         */
        public static function  getInstance(sprite:Sprite):Adapter
        {
            if (instance == null)
            {
                if(ExternalInterface.available)
                {
                    ExternalInterface.marshallExceptions = true;
                    instance = new Adapter(sprite);
                }
                else
                {
                    throw new Error("ExternalInterface unavailable");
                }
            }
            return instance;
        }
        
        /**
         * 注册实例,并返回实例编号 
         * @param instance 实例
         * @return 实例编号
         */		
        private function regist(instance:Object,key:String=null):String
        {
            for(var k:* in _as_cache)
            {
                if(_as_cache[k] == instance)
                {
                    return k;
                }
            }
            
            if(key)
            {
                _as_cache[key] =  instance;
                return key;
            }
            
            _seq++;
            var key:String = AS_OBJ+getQualifiedClassName(instance) +"_" +_seq.toString(16);
            _as_cache[key] =  instance;
            return key;
        }
        
        private function R(node:String,klass:String,attrName:String="@name"):Array
        {
            var xml:XML = reflect(klass);
            var temp:Array = [];
			trace(node+","+attrName);
            for each(var m:* in xml[node][attrName])
            {
                temp.push(m.toString());
            }
            return temp;
        }
        /**
         * 创建
         * @param klass 完整带包结构的类名
         * @param props 配置项
         */
        private function $(klass:String,props:Object):*
        {
            var ClassReference:Class;
            var instance:Object;
            if(klass.indexOf("#") == 0)
            {
                ClassReference= getDefinitionByName(klass.replace(/#/,"")) as Class;
                return regist(ClassReference);
            }
            
            ClassReference= getDefinitionByName(klass) as Class;
            if(props is Array)
            {
                switch(props.length)
                {
                    case 0:
                        instance = new ClassReference();
                        break;
                    case 1:
                        instance = new ClassReference(decode(props[0]));
                        break;
                    case 2:
                        instance = new ClassReference(decode(props[0]),decode(props[1]));
                        break;
                    case 3:
                        instance = new ClassReference(decode(props[0]),decode(props[1]),decode(props[2]));
                        break;
                    case 4:
                        instance = new ClassReference(decode(props[0]),decode(props[1]),decode(props[2]),decode(props[3]));
                        break;
                    case 5:
                        instance = new ClassReference(decode(props[0]),decode(props[1]),decode(props[2]),decode(props[3]),decode(props[4]));
                        break;
                    case 6:
                        instance = new ClassReference(decode(props[0]),decode(props[1]),decode(props[2]),decode(props[3]),decode(props[4]),decode(props[5]));
                        break;
                    case 7:
                        instance = new ClassReference(decode(props[0]),decode(props[1]),decode(props[2]),decode(props[3]),decode(props[4]),decode(props[5]),decode(props[6]));
                        break;
                    case 8:
                        instance = new ClassReference(decode(props[0]),decode(props[1]),decode(props[2]),decode(props[3]),decode(props[4]),decode(props[5]),decode(props[6]),decode(props[7]));
                        break;
                }
            }
            else
            {
                instance= new ClassReference();
                for(var attr:String in props )//配置项的属性必须是instance拥有的
                {
                    if(instance.hasOwnProperty(attr))
                    {
                        instance[attr] = decode(props[attr]);
                    }
                }
            }
            return regist(instance);
        }
        /**
         * 获取实例的属性值
         * @param instance 父实例编号
         * @param propertyChain 属性链
         * @return 子实例编号
         */		
        private function G(instance:String,propertyChain:Array):*{
            var host:Object = decode(instance);
            if(instance == host)
            {
                return false;
            }
            
            var child:Object;
            var parent:Object = host;
            
            for each(var property:String in propertyChain)
            {
                child = parent[property];
                parent = child;
            }
            return encode(child);
        }
        
        private function S(host:String,property:Object,argArray:Array=null):*
        {
            var host_instance:Object = decode(host);
            
            if( host_instance.hasOwnProperty(property) && host_instance[property] is Function)
            {
                var _argArray:Array = [];
                var len:int = argArray.length;
                for(var i:int=0;i<len;i++)
                {
                    var k:* = argArray[i];
                    _argArray.push(decode(k));
                }
                var t:Object = host_instance[property].apply(null,_argArray);
                if(t)
                    return encode(t);
            }
            else if(property is Object)
            {
                for(var key:String in property)
                {
                    if(host_instance.hasOwnProperty(key))
                    {
                        host_instance[key] = decode(property[key]);
                    }
                }
            }
        }
        
        /**
         * 返回一个类或实例的描述
         * @param klass 类或实例
         * @return 类或实例的描述
         */		
        private function reflect(klass:String):XML
        {
            var xml:XML;
            xml =  describeType(decode(klass));
            return xml;
        }
        
        private function onAppRollOut(event:MouseEvent):void
        {
            if(Capabilities.hasIME){
                try
                {
                    if(!IME.enabled)
                    {
                        IME.enabled = true;
                    }
                }
                catch(e:Error)
                {
                    trace(e);
                }
            }
        }
        
        private function callJS(functionname:String,parameters:*):*
        {
            try
            {
                return ExternalInterface.call(functionname,parameters);
            }
            catch(e:Error)
            {
                ExternalInterface.call("eval",'alert( "'+e.message[0]+'")');
            }
        }
        
        //初始化常用类
        private function initialKlasses():void
        {
            var ags:String = "com.esri.ags";
            evalKlass(ags,["Graphic"]);
            
            var ags_geom:String = ags + ".geometry";
            evalKlass(ags_geom,["MapPoint","Polyline","Polygon","Extent"]);
            
            var ags_layers:String = ags + ".layers";
            evalKlass(ags_layers,["GraphicsLayer"]);
            
            var ags_symbols:String = ags + ".symbols";
            evalKlass(ags_symbols,["SimpleLine","Composite","PictureFill",
                "SimpleMarker","SimpleFill","Text","PictureMarker"],"Symbol");
            
            var yhte:String = "net.yhte.gis";
            var yhte_layers:String = yhte + ".layers";
            evalKlass(yhte_layers,["GJson","Json","GMap","YhDynamic"],"Layer");
        }
        
        private function evalKlass(pkg:String,klasses:Array,
                                   suffix:String=""):void
        {
            for each(var n:String in klasses)
            {
                var klass:String = pkg + "." + n + suffix;
                var script:String = "iMap['" + n + suffix + 
                    "'] = function(options){return Ao.$('" + 
                    klass + "',options);};"
                callJS("eval",script);
            }
        }
    }
}