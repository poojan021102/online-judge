#include<stdio.h>

int main(){
int a,b;
scanf("%d %d",&a,&b);
int ans = 1;
while(b){
if(b&1)ans*=a;
a*=a;
b>>=1;
}
printf("%d",ans);
return 0;
}