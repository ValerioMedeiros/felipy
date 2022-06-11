import React from "react"
import { SafeAreaView, Text, View } from "react-native"
import { useTailwind } from "tailwind-rn"

export default function Hello() {
  const t = useTailwind()

  return (
    <SafeAreaView style={t("h-full")}>
      <View style={t("pt-12 items-center")}>
        <View style={t("bg-blue-200 px-3 py-1 rounded-full")}>
          <Text style={t("text-blue-800 font-semibold")}>
            Hello tailwind
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
