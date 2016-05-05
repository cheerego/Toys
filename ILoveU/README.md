# 这是一段C语言程序
这段程序来源于
[美剧硅谷第三季第一集神秘代码写的是什么？](https://www.zhihu.com/question/44606486)

```c
#include <stdio.h>
#include <stdlib.h>

typedef unsigned long u64;

typedef void enc_cfg_t;
typedef int enc_cfg2_t;
typedef __int128_t dcf_t;

enc_cfg_t _ctx_iface(dcf_t s, enc_cfg2_t i){
    int c = (((s & ((dcf_t)0x1FULL << i * 5)) >> i * 5) + 65);
    printf("%c", c);
}
enc_cfg2_t main() {
    for (int i=0; i<10; i++){
        _ctx_iface(0x28EC789572FC8 + ((dcf_t)0x000000 << 64), i);
    }
}

```
```bash
$ gcc -o awesome awesome.c
$ ./awesome
```
结果是: I_LOVE_U