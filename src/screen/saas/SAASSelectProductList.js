import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import ProductList from './component/SAASProductList'

/**
 * 产品列表
 * todo:
 */
class SAASSelectProductList extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <ProductList navigation={navigation} type={'1'} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
})

const mapStateToProps = (state) => {
  return {
    companyInfo: state.company,
  }
}

export default connect(mapStateToProps)(SAASSelectProductList)
