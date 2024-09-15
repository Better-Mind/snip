import { useEffect, useState } from "react";
import { useCurrentCategory } from "./CategoryProvider";
import { useLocalStorage } from "usehooks-ts";
import { FeatureSchema, HistoryMapSchema, imageFeatures, imageSummarization } from "@/services/groq.service";
import { listen } from "@tauri-apps/api/event";
import { RustData } from "@/rust-types";
import { Card } from "./ui/card";
import DynamicFeatureTable from "./DynamicFeatureTable";
import { Button } from "./ui/button";

interface Row {
	[key: string]: string
}

export function InnerComp() {
	const [expandedImageUrl, setExpandedImageUrl] = useState<string>();
	const {currentCategory, setCurrentCategory} = useCurrentCategory();
	const [categories, setCategories] = useLocalStorage<string[]>("categories", []);
	const [historyMap, setHistoryMap] = useLocalStorage<HistoryMapSchema>("historyMap", {});
	const [rows, setRows] = useLocalStorage<Row[]>("rows", []);
  
	const fetchData = async (image_path: string) => {
	  const history = historyMap[currentCategory] || [];
  
	  const description = await imageSummarization(image_path);
	  // console.log(description);
	  const res = await imageFeatures(image_path, history, description || "");
	  console.log(res);
	  res.imagePath = image_path;
	  // add the result to history
	  if (currentCategory) {
		setHistoryMap((prev) => ({
		  ...prev,
		  [currentCategory]: [...(prev[currentCategory] || []), res as FeatureSchema] 
		}))
	  }
  
	  return res;
	};
  
	useEffect(() => {
	  const unlisten = listen<RustData>("new_screenshot", async (event) => {
		console.log("New screenshot at path:", event.payload.path);
		
		await fetchData(event.payload.path);
  
	  });
  
	  return () => {
		unlisten.then((fn) => fn());
	  };
	}, [currentCategory]);

	useEffect(() => {
	  const history = historyMap[currentCategory] || [];
	  let rows = [];
  
	  for (const datapoint of history) {
		let row: {[key: string]: any} = {_imagePath: datapoint.imagePath};
		for (const feature of datapoint.features) {
		  // TODO handle each ttype specifically when rendering table 
		  row[feature.name] = feature.value;
		}
		rows.push(row);
	  }
  
	  console.debug('rows', rows);
  
	  setRows(rows);
	}, [historyMap, currentCategory])

	//		{/* <ImageTable columns={restaurantColumnDef} data={displayRows} />
		//<div>{JSON.stringify(historyMap)}</div> */}

	return (
		<DynamicFeatureTable datapoints={rows}></DynamicFeatureTable>
	)
}