import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Value } from '@/services/groq.service'
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from './ui/badge'
import { ArrowUpFromLine, Ellipsis, Star, Aperture, BarChart, Feather, LightbulbIcon, Scissors, Search, Squirrel, SquareArrowOutUpLeft } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { useCurrentCategory } from './CategoryProvider'
import { convertFileSrc } from '@tauri-apps/api/core'

type DataPoint = Record<string, Value>

interface DynamicFeatureTableProps {
  datapoints: DataPoint[]
}

function isStringArray(value: any): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isString(value: any): value is string {
  return typeof value == 'string';
}

function renderHeader(key: string) {
  if (key == "_imagePath") {
    return "Item"
  }
  return key
}

function renderCell(key: string, cell: Value) {
  if (key == '_imagePath' && isString(cell)) {
    const imgPath = convertFileSrc(cell);
    return (
      <img src={imgPath}/>
    )
  }
  switch (typeof cell) {
    case 'string':
      return cell;
    case 'number':
      return String(cell);
    case 'boolean':
      return (
        <Checkbox id="" checked={Boolean(cell)} />
      );
    case 'undefined':
      return '-';
    default: {}
  }
  if (isStringArray(cell)) {
    return (
      <div className="flex flex-col gap-2 items-start">
      {cell.map((badge, index) => <Badge className="text-nowrap" key={index}>{badge}</Badge>)}
      </div>
    )
  } else {
    return '-';
  }
}

export default function DynamicFeatureTable({ datapoints = [] }: DynamicFeatureTableProps) {

	const {currentCategory, setCurrentCategory} = useCurrentCategory();
  // Check if datapoints is empty
  if (currentCategory === "Home") {
    const tips = [
      { icon: Feather, color: "text-pink-400", text: "Just take a snapshot to get started!" },
      { icon: Search, color: "text-sky-400", text: "Source and research carefree!" },
      { icon: LightbulbIcon, color: "text-yellow-400", text: "Find it all compiled into a nice table for you!" },
    ]
    return (
		<div className="flex flex-col h-full items-center justify-center bg-transparent pt-10">
      <Scissors className='w-24 h-24'/>
			{/* <div className="mb-12">
				<img src={"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SZHT4oirEmmx4NjQoK2sQkXVcBSbUT.png"} alt={"clip icon"} style={{ width: "200px", height: "200px" }} />
			</div> */}
      <h1 className="scroll-m-20 mt-6 text-4xl font-extrabold tracking-tight lg:text-5xl">
        welcome to snip.
      </h1>
			<div className="flex flex-wrap justify-center gap-4 w-full max-w-4xl pt-10">
			{tips.map((tip, index) => (
				<Card key={index} className="w-[240px] bg-white shadow-sm hover:shadow-md transition-shadow">
				<CardContent className="p-6 flex flex-col items-center text-center">
					<tip.icon className={`w-8 h-8 ${tip.color} mb-4`} />
					<p className="text-sm text-gray-600">{tip.text}</p>
				</CardContent>
				</Card>
			))}
			</div>
		</div>
	)
  }

  if(datapoints.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-transparent pt-10">
					<Squirrel className={`w-20 h-20 stroke-gray-700 mb-4`} />
					<p className="text-2xl text-gray-700">It seems like you have nothing here...</p>
      </div>
    )
  }

  // Extract all unique keys (features) from the datapoints
  const allFeatures = React.useMemo(() => {
    const featureSet = new Set<string>()
    datapoints.forEach(datapoint => {
      Object.keys(datapoint).forEach(key => {
        if (!key.startsWith('_')) {
          featureSet.add(key)
        }
      })
    })
    return Array.from(['_imagePath', ...featureSet])
  }, [datapoints])

  return (
  <div>
    <div className="justify-end shrink-0 mt-1 mx-1">
      <div className="flex flex-row justify-end">
        <Button className="px-2" variant="link">
          <SquareArrowOutUpLeft className="h-4 w-4 pr-1" />
          Export
        </Button>
        <Button className="px-2" variant="link">
          <Star className="h-4 w-4" />
        </Button>
        <Button className="px-2" variant="link">
          <Ellipsis className="h-4 w-4" />
        </Button>
      </div>
    </div>

    <div className="mx-20">

      <div>
        <div className="justify-start mt-6 mb-4 shrink-0">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">{currentCategory}</h1>
        </div>
      </div>

      <Card>
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {allFeatures.map(feature => (
                  <TableHead key={feature} className="px-4 py-2">
                    {renderHeader(feature)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {datapoints.map((datapoint, index) => (
                <TableRow key={index}>
                  {allFeatures.map(feature => (
                    <TableCell key={feature} className="px-4 py-2">
                      {renderCell(feature, datapoint[feature])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  </div>
  )
}