# 探究Laravel的dd方法
###### what is dd?
* 是laravel封装的一个函数,方法
* 功能类似于php原生的var_dump和print_r,对数据进行打印输出
* 只是对var_dump和print_r进行了扩展,添加了一些样式和一个折叠效果

## focus source code:
#### 1.哪里定义了dd?
>vendor/laravel/framework/src/Illuminate/Support/helpers.php
#### 2.dd写了什么?
```PHP
if (! function_exists('dd')) {
   /**
     * Dump the passed variables and end the script.
     *
     * @param  mixed
     * @return void
   */
  function dd()
  {
      array_map(function ($x) {
             (new Dumper)->dump($x);
          },
           func_get_args());
      die(1);
  }
}

```
#### 3.这段代码的功能
* 判断函数是否定义
* 如果方法不存在就定义
* func_get_args得到dd的参数
* 然后是用array_map遍历执行(new _**`Dumper`**_)->_**`dump`**_($x)

## What is the class Dumper and function dump
###### 1.类的位置:
>vendor/laravel/framework/src/Illuminate/Support/Debug/Dumper.php

###### 2.class Dumper 写了什么
```PHP
<?php
namespace Illuminate\Support\Debug;

use Symfony\Component\VarDumper\Dumper\CliDumper;
use Symfony\Component\VarDumper\Cloner\VarCloner;

class Dumper
{
    /**
     * Dump a value with elegance.
     *
     * @param  mixed $value
     * @return void
     */
    public function dump($value)
    {
        if (class_exists(CliDumper::class)) {

            $dumper = 'cli' === PHP_SAPI ? new CliDumper : new HtmlDumper;

            $dumper->dump((new VarCloner)->cloneVar($value));
        } else {
            var_dump($value);
        }
    }
}
```
###### 3.dump方法在干什么?
* Symfony的两个组件防止重复造轮子
* 判断CliDumper这个类是否存在,如果不存在就直接var_dump进行屏幕打印
* $dumper = ('cli' === PHP_SAPI ? new CliDumper : new HtmlDumper);判断是CLI模式还是网页环境,然后实例化相应的对象.
* 现在的环境是HtmlDumper
## What is class HtmlDumper?
###### 1.where is the class HtmlDumper
>vendor/laravel/framework/src/Illuminate/Support/Debug/HtmlDumper.php:2
###### 2.Class HtmlDumper Content
```PHP
<?php

namespace Illuminate\Support\Debug;

use Symfony\Component\VarDumper\Dumper\HtmlDumper as SymfonyHtmlDumper;

class HtmlDumper extends SymfonyHtmlDumper
{
    /**
     * Colour definitions for output.
     *
     * @var array
     */
    protected $styles = [
        'default' => 'background-color:#fff; color:#222; line-height:1.2em; font-weight:normal; font:12px Monaco, Consolas, monospace; word-wrap: break-word; white-space: pre-wrap; position:relative; z-index:100000',
        'num' => 'color:#a71d5d',
        'const' => 'color:#795da3',
        'str' => 'color:#df5000',
        'cchr' => 'color:#222',
        'note' => 'color:#a71d5d',
        'ref' => 'color:#a0a0a0',
        'public' => 'color:#795da3',
        'protected' => 'color:#795da3',
        'private' => 'color:#795da3',
        'meta' => 'color:#b729d9',
        'key' => 'color:#df5000',
        'index' => 'color:#a71d5d',
    ];
}

```
3.what is the code's function?
* 仅仅是定义了一下样式
* 而且没有定义dump方法,继承至SymfonyHtmlDumper,所以需要在父类中查看dump

## What is SymfonyHtmlDumper
###### 1.Where is SymfonyHtmlDumper?
>vendor/symfony/var-dumper/Dumper/HtmlDumper.php:2
###### 2.what is the class content?
```PHP
class HtmlDumper extends CliDumper
{
    /**
     * {@inheritdoc}
     */
    public function dump(Data $data, $output = null)
    {
        parent::dump($data, $output);
        $this->dumpId = 'sf-dump-'.mt_rand();
    }


    <script>
    Sfdump = window.Sfdump || (function (doc) {

    var refStyle = doc.createElement('style'),
        rxEsc = /([.*+?^${}()|\[\]\/\\])/g,
        idRx = /\bsf-dump-\d+-ref[012]\w+\b/,
        keyHint = 0 <= navigator.platform.toUpperCase().indexOf('MAC') ? 'Cmd' : 'Ctrl',
        addEventListener = function (e, n, cb) {
            e.addEventListener(n, cb, false);
        };

    (doc.documentElement.firstElementChild || doc.documentElement.children[0]).appendChild(refStyle);

    if (!doc.addEventListener) {
        addEventListener = function (element, eventName, callback) {
            element.attachEvent('on' + eventName, function (e) {
                e.preventDefault = function () {e.returnValue = false;};
                e.target = e.srcElement;
                callback(e);
            });
        };
    }
    </script>

}
```
3.what is the code's function?
* 执行父类CliDumper的dump方法   (看到这里我已经醉了)
* 里面还有一些乱七八招的js代码
* CliDumper还进行了终端环境的检测

# 到这里我已经写不下去了
                    function dd()
                          |  使用Dumper类的dump方法
                    class Dumper
                          |  使用HtmlDumper类
                    HtmlDumper extends SymfonyHtmlDumper   这个类中仅仅第一了样式
                          |   HtmlDump继承 SymfonyHtmlDumper(Symfony/HtmlDumper的别名)
                    class SymfonyHtmlDump (class HtmlDumper extends CliDumper)
                          |   这个类中的dump方法调用parent::dump
                    class CliDumper extends AbstractDumper
                          |   这个类中并没有dump方法,所以这个方法来自于AbstractDumper
                    abstract class AbstractDumper implements DataDumperInterface, DumperInterface
                          |   AbstractDumper是一个抽象类 实现了DataDumperInterface这个接口,该接口包含dump方法
                          |   所以说明dump方法是在这二个抽象类的子类中实现
                    ```PHP
                        /**
                         * Dumps a Data object.
                         *
                         * @param Data                          $data   A Data object.
                         * @param callable|resource|string|null $output A line dumper callable, an opened stream or an output path.
                         */
                        public function dump(Data $data, $output = null)
                        {
                            $exception = null;
                            if ($output) {
                                $prevOutput = $this->setOutput($output);
                            }
                            try {
                                $data->dump($this);
                                $this->dumpLine(-1);
                            } catch (\Exception $exception) {
                                // Re-thrown below
                            }
                            if ($output) {
                                $this->setOutput($prevOutput);
                            }
                            if (null !== $exception) {
                                throw $exception;
                            }
                        }
                    ```
                    这时还牵扯了一个class Data
                    然后我完全看不懂了 这个代码是什么意思,深深地被 Artisans的轮子功力给折服
                    不经引起了我的思考难道是我真的太菜了?