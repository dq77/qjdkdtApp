import { NativeModules, Platform } from 'react-native'
import PermissionUtils from './PermissionUtils'
import Geolocation from 'react-native-geolocation-service'

export async function getLocation () {
  var GPS = {
    PI: 3.14159265358979324,
    x_pi: 3.14159265358979324 * 3000.0 / 180.0,
    delta: function (lat, lon) {
      // Krasovsky 1940
      //
      // a = 6378245.0, 1/f = 298.3
      // b = a * (1 - f)
      // ee = (a^2 - b^2) / a^2;
      var a = 6378245.0 //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
      var ee = 0.00669342162296594323 //  ee: 椭球的偏心率。
      var dLat = this.transformLat(lon - 105.0, lat - 35.0)
      var dLon = this.transformLon(lon - 105.0, lat - 35.0)
      var radLat = lat / 180.0 * this.PI
      var magic = Math.sin(radLat)
      magic = 1 - ee * magic * magic
      var sqrtMagic = Math.sqrt(magic)
      dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * this.PI)
      dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * this.PI)
      return { lat: dLat, lon: dLon }
    },

    // GPS---高德
    gcj_encrypt: function (wgsLat, wgsLon) {
      if (this.outOfChina(wgsLat, wgsLon)) { return { lat: wgsLat, lon: wgsLon } }

      var d = this.delta(wgsLat, wgsLon)
      return { lat: wgsLat + d.lat, lon: wgsLon + d.lon }
    },
    outOfChina: function (lat, lon) {
      if (lon < 72.004 || lon > 137.8347) { return true }
      if (lat < 0.8293 || lat > 55.8271) { return true }
      return false
    },
    transformLat: function (x, y) {
      var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
      ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0
      ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) * 2.0 / 3.0
      ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y * this.PI / 30.0)) * 2.0 / 3.0
      return ret
    },
    transformLon: function (x, y) {
      var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
      ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0
      ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) * 2.0 / 3.0
      ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x / 30.0 * this.PI)) * 2.0 / 3.0
      return ret
    }
  }
  const hasPermission = await PermissionUtils.checkPermission(PermissionUtils.PERMISSION.location)
  console.log(hasPermission)
  if (hasPermission) {
    if (Platform.OS === 'android') {
      const result = await NativeModules.LocationModule.getLocation()
      console.log(result)
      return result
    } else {
      const result1 = await new Promise(resolve => {
        Geolocation.getCurrentPosition(
          (position) => {
            const result = ({
              latitude: position.coords.latitude.toFixed(6),
              longitude: position.coords.longitude.toFixed(6)
            })
            console.log(result)
            resolve(result)
          },
          (error) => {
            console.log(error)
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        )
      }).then((resolve) => {
        return resolve
      })
      const conver = await GPS.gcj_encrypt(parseFloat(result1.latitude), parseFloat(result1.longitude))
      console.log({
        latitude: conver.lat.toFixed(6),
        longitude: conver.lon.toFixed(6)
      }, 'latitude longitude')
      return {
        latitude: conver.lat.toFixed(6),
        longitude: conver.lon.toFixed(6)
      }
    }
  }
}
