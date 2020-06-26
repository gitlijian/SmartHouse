//
//  ViewController.m
//  SmartHouse
//
//  Created by 曾祺植 on 2016/10/14.
//  Copyright © 2016年 曾祺植. All rights reserved.
//

#import "ViewController.h"
#import "PDRCore.h"
#import "PDRCoreApp.h"
#import "PDRCoreAppInfo.h"
#import "PDRCoreAppWindow.h"
#import "PDRCoreAppManager.h"
#import "AsyncUdpSocket.h"

@interface ViewController ()<AsyncUdpSocketDelegate> {
    AsyncUdpSocket* _sendSocket;
}

@property (nonatomic, strong) PDRCoreApp* pAppHandle;

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self Start5pEngineAsWidget];
    _sendSocket = [[AsyncUdpSocket alloc] initWithDelegate:self];
    [_sendSocket bindToPort:6788 error:nil];
    // Do any additional setup after loading the view, typically from a nib.
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    self.navigationController.navigationBarHidden = YES;
}

-(void)Start5pEngineAsWidget
{
    // 设置WebApp所在的目录，该目录下必须有mainfest.json
    NSString* pWWWPath = [[[NSBundle mainBundle] bundlePath] stringByAppendingPathComponent:@"Pandora/apps/smart/www/login"];
    
    // 如果路径中包含中文，或Xcode工程的targets名为中文则需要对路径进行编码
    //    NSString* pWWWPath2 =  (NSString *)CFBridgingRelease(CFURLCreateStringByAddingPercentEscapes( kCFAllocatorDefault, (CFStringRef)pWWWPath, NULL, NULL,  kCFStringEncodingUTF8 ));
    CGRect frame = CGRectMake(0, 20, self.view.bounds.size.width, self.view.bounds.size.height - 20);
    UIView* contentView = [[UIView alloc] initWithFrame:frame];
    contentView.backgroundColor = [UIColor whiteColor];
    contentView.tag = 1;
    // 设置5+SDK运行的View
    [self.view addSubview:contentView];
    [[PDRCore Instance] setContainerView:contentView];
    // 传入参数可以在页面中通过plus.runtime.arguments参数获取
    NSString* pArgus = @"id=plus.runtime.arguments";
    // 启动该应用
    self.pAppHandle = [[[PDRCore Instance] appManager] openAppAtLocation:pWWWPath withIndexPath:@"login.html" withArgs:pArgus withDelegate:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(H5PNjsNotification:) name:@"PostControllCodes" object:nil];
    
    // 如果应用可能会重复打开的话建议使用restart方法
    //[[[PDRCore Instance] appManager] restart:pAppHandle];
}

- (NSData *)convertHexStrToString:(NSString *)str {
    if (!str || [str length] == 0) {
        return nil;
    }
    
    NSMutableData *hexData = [[NSMutableData alloc] initWithCapacity:8];
    NSRange range;
    if ([str length] % 2 == 0) {
        range = NSMakeRange(0, 2);
    } else {
        range = NSMakeRange(0, 1);
    }
    for (NSInteger i = range.location; i < [str length]; i += 2) {
        unsigned int anInt;
        NSString *hexCharStr = [str substringWithRange:range];
        NSScanner *scanner = [[NSScanner alloc] initWithString:hexCharStr];
        
        [scanner scanHexInt:&anInt];
        NSData *entity = [[NSData alloc] initWithBytes:&anInt length:1];
        [hexData appendData:entity];
        
        range.location += range.length;
        range.length = 2;
    }
    return hexData;
}

- (void)H5PNjsNotification:(NSNotification*)pNotifi
{
    NSString *tmpS = pNotifi.object;
    NSData *jsonData = [tmpS dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *dataDic = [NSJSONSerialization JSONObjectWithData:jsonData options:NSJSONReadingAllowFragments error:nil];
    //NSString *message = [dataDic valueForKey:@"controllCode"];
    NSString *message = @"5aa5aa555aa5aa550000000000000000000000000000000000000000000000004d2e000012276a002580da3baa0d43b40100000052d400008f819c563e26b00806955756a17cae49dfc06b60cfbe21dee754bbf4a7af7556da9765dfa62453e67397f49a5999b5baeb6a0488745a6e3183cdae4c78845b4730007eb02195f3c4b8890552beefc4db16167cd60b5b32f824f0aeac8a2e2c2736b91e10f91c5e6394a3847d21169b28a12b64b4eeaaed4bf4e2fab8085e72eb8ed062de6808757cd237326d3daee2a76dfc1466754ab0951c08d5927c40cae70a2a4434e9c5262e88c523f4d862d454cb292a7d459f9fe4849541083c8bc2322a5c0241cc529363f58399663d49ba93";
    //NSString *ip = [dataDic valueForKey:@"ip"];
    NSString *ip = @"192.168.10.119";
    NSString *sPort = [dataDic valueForKey:@"port"];
    UInt16 port = [sPort intValue];
    NSData *ControlData = [self convertHexStrToString:message];
    NSLog(@"%hu",port);
    [_sendSocket sendData:ControlData toHost:ip port:port withTimeout:30 tag:0];

}

- (BOOL)onUdpSocket:(AsyncUdpSocket *)sock didReceiveData:(NSData *)data withTag:(long)tag fromHost:(NSString *)host port:(UInt16)port{
    /*
     <message>
     <ip>
     <port>
     */
    //将 NSData 转 为 NSString

    return YES;
}



@end
