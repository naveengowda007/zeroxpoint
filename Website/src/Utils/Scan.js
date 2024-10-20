import { setCart } from 'redux/Cart';
import { uuid } from '../res';

export const AddItemToCart = (data = [], dispatch, Prices, setItem, Item, Cart) => {
	data = data.filter(val => {
		let fileExtension = val?.name?.split('.').pop();
		if (!['jpg', 'jpeg', 'heic', 'gif', 'png', 'pdf', 'doc', 'docx',
			'txt', 'xls', 'xlsx', 'pptx', 'csv'].includes(fileExtension)) {
			return false
		}
		return true
	})

	data = data.map(item => ({ fileBlob: item, name: item?.name, path: item?.preview }))

	if (data.length === 0) {
		return
	}

	const tempUniquePaperSizes = [...new Map(Prices.PaperSizeData.map(item => [item["name"], item])).values()]

	const tempData = []
	data.forEach((val) => {
		let temp = {
			"name": val?.name,
			"id": uuid(),
			"uri": val?.path,
			"isUpdate": false,
			"pages": 1,
			"copies": 1,
			"color": "BW",
			"sides": "single-side",
			"size": tempUniquePaperSizes[0],
			"paper": Prices.paperTypes[0],
			"binding": Prices.bindingOptions[0],

			// "fileBlob": val?.fileBlob
		}

		tempData.push(temp)
	})

	dispatch(setCart(tempData))
	setItem(tempData[0])
}